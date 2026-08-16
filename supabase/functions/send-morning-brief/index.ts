// Supabase Edge Function : envoie AUTOMATIQUEMENT par email le dernier
// Morning Brief / Weekly publié sur bourseinfo.ma, à tous les utilisateurs
// inscrits — sans jamais envoyer deux fois le même brief.
//
// Logique :
//   1) Va chercher public/data/morning_briefs.json sur le site (le premier
//      élément du tableau "briefs" est toujours le plus récent).
//   2) Vérifie dans la table `sent_briefs` si ce brief (identifié par sa
//      date) a déjà été envoyé.
//   3) Si non : envoie l'email à tous les inscrits, puis enregistre l'envoi.
//   4) Si oui : ne fait rien (sécurité anti-doublon, permet d'appeler la
//      fonction tous les jours sans risque de spam).
//
// SÉCURITÉ : SUPABASE_SERVICE_ROLE_KEY et RESEND_API_KEY sont des secrets,
// jamais exposés au navigateur, configurés uniquement côté Supabase.
//
// Déploiement (une seule fois, depuis Supabase CLI) :
//   supabase functions deploy send-morning-brief
//   supabase secrets set RESEND_API_KEY=re_xxx
//
// Appel manuel de test :
//   curl -X POST https://<project-ref>.supabase.co/functions/v1/send-morning-brief \
//     -H "Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>"

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM_EMAIL = "BourseInfo.ma <noreply@bourseinfo.ma>";
const SITE_URL = "https://www.bourseinfo.ma";
const BRIEFS_URL = `${SITE_URL}/data/morning_briefs.json`;

function buildHtml(brief: any): string {
  const badgeLabel = brief.badge || "MORNING BRIEF";
  return `<!doctype html>
<html lang="fr"><head><meta charset="UTF-8"><title>${badgeLabel}</title></head>
<body style="margin:0;padding:0;background:#FAFAF9;font-family:Arial,Helvetica,sans-serif;color:#1C242C;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#FAFAF9;">
  <tr><td style="background:#2B3A4A;padding:26px 30px;">
    <table role="presentation" width="100%"><tr>
      <td style="color:#fff;font-size:22px;font-weight:800;letter-spacing:0.5px;">${badgeLabel}</td>
      <td align="right">
        <div style="color:#fff;font-weight:700;font-size:14px;">BourseInfo<span style="color:#C9A24B;">.ma</span></div>
        <div style="color:#9AA6B0;font-size:11px;">Marchés financiers marocains</div>
      </td>
    </tr></table>
    <div style="color:#C9A24B;font-size:12px;margin-top:12px;letter-spacing:0.5px;">| CASABLANCA | ${brief.dateLabel}</div>
  </td></tr>
  <tr><td style="padding:26px 30px 10px;">
    <div style="font-size:17px;font-weight:800;line-height:1.35;margin-bottom:12px;">${brief.titre}</div>
    <p style="font-size:14px;line-height:1.65;color:#3a4550;margin:0 0 24px;">${brief.resumeCourt}</p>
    <a href="${SITE_URL}/#brief-detail" style="display:inline-block;background:#C9A24B;color:#fff;text-decoration:none;font-weight:700;font-size:13px;padding:12px 22px;border-radius:6px;">
      Lire le brief complet →
    </a>
  </td></tr>
  <tr><td style="background:#2B3A4A;padding:16px 30px;text-align:center;color:#9AA6B0;font-size:11px;">
    Vous recevez cet email car vous êtes inscrit(e) sur bourseinfo.ma. Contenu à but informatif, ne constitue pas un conseil en investissement.
  </td></tr>
</table>
</body></html>`;
}

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get("Authorization") || "";
    if (authHeader !== `Bearer ${SERVICE_ROLE_KEY}`) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // 1) Récupère tous les briefs depuis le site
    const briefsRes = await fetch(BRIEFS_URL, { cache: "no-store" });
    if (!briefsRes.ok) throw new Error("Impossible de charger morning_briefs.json");
    const { briefs } = await briefsRes.json();
    if (!briefs || briefs.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: "Aucun brief disponible" }), { status: 200 });
    }

    // 2) Repère lesquels n'ont jamais été envoyés (peut être plusieurs :
    //    ex. un Weekly ET un Morning Brief publiés le même jour, ou un
    //    passage du robot manqué la veille)
    const { data: sentRows } = await supabase.from("sent_briefs").select("brief_date");
    const alreadySent = new Set((sentRows || []).map((r: any) => r.brief_date));
    const toSend = briefs.filter((b: any) => !alreadySent.has(b.date));

    if (toSend.length === 0) {
      return new Response(
        JSON.stringify({ sent: 0, message: "Aucun nouveau brief à envoyer, tout est déjà à jour." }),
        { status: 200 }
      );
    }

    // 3) Récupère tous les utilisateurs inscrits (une seule fois)
    let allEmails: string[] = [];
    let page = 1;
    while (true) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) throw error;
      allEmails.push(...data.users.map((u) => u.email).filter((e): e is string => !!e));
      if (data.users.length < 1000) break;
      page++;
    }

    // 4) Envoie un email distinct pour chaque nouveau brief, du plus ancien
    //    au plus récent (ordre logique de lecture), puis marque chacun comme envoyé.
    const results: any[] = [];
    for (const brief of [...toSend].reverse()) {
      let sentCount = 0;
      if (allEmails.length > 0) {
        const html = buildHtml(brief);
        const subject = `${brief.badge || "The Morning Brief"} — ${brief.dateLabel}`;
        const batchSize = 50;
        for (let i = 0; i < allEmails.length; i += batchSize) {
          const batch = allEmails.slice(i, i + batchSize);
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ from: FROM_EMAIL, to: FROM_EMAIL, bcc: batch, subject, html }),
          });
          if (res.ok) sentCount += batch.length;
        }
      }
      await supabase.from("sent_briefs").insert({ brief_date: brief.date, recipients_count: sentCount });
      results.push({ brief: brief.date, sent: sentCount });
    }

    const totalSent = results.reduce((s, r) => s + r.sent, 0);
    return new Response(JSON.stringify({ totalSent, briefsProcessed: results.length, details: results }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
