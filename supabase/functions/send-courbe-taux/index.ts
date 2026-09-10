// Supabase Edge Function : envoie AUTOMATIQUEMENT par email la dernière
// courbe des taux (marché secondaire des bons du Trésor) publiée sur
// bourseinfo.ma, à tous les utilisateurs inscrits — sans jamais envoyer
// deux fois la même courbe.
//
// Logique (calquée sur send-morning-brief) :
//   1) Va chercher public/data/courbe_taux.json sur le site (tableau trié
//      par date croissante — le DERNIER élément est toujours le plus récent).
//   2) Vérifie dans la table `sent_courbes` si cette date a déjà été envoyée.
//   3) Si non : calcule la variation vs la séance précédente (J vs J-1, en
//      points de base) pour les 9 maturités, envoie l'email à tous les
//      inscrits, puis enregistre l'envoi.
//   4) Si oui : ne fait rien (sécurité anti-doublon, permet d'appeler la
//      fonction tous les jours sans risque de spam — la courbe n'est mise
//      à jour que ponctuellement, pas quotidiennement).
//
// SÉCURITÉ : SUPABASE_SERVICE_ROLE_KEY et RESEND_API_KEY sont des secrets,
// jamais exposés au navigateur, configurés uniquement côté Supabase (les
// mêmes secrets que send-morning-brief peuvent être réutilisés tels quels).
//
// Déploiement (une seule fois, depuis Supabase CLI) :
//   supabase functions deploy send-courbe-taux
//   (RESEND_API_KEY est déjà configuré si send-morning-brief est en place)
//
// Appel manuel de test :
//   curl -X POST https://<project-ref>.supabase.co/functions/v1/send-courbe-taux \
//     -H "Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>"

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM_EMAIL = "BourseInfo.ma <noreply@bourseinfo.ma>";
const SITE_URL = "https://www.bourseinfo.ma";
const CURVE_URL = `${SITE_URL}/data/courbe_taux.json`;

const MATURITES = [
  { key: "13S", label: "13 sem." },
  { key: "26S", label: "26 sem." },
  { key: "52S", label: "52 sem." },
  { key: "2A", label: "2 ans" },
  { key: "5A", label: "5 ans" },
  { key: "10A", label: "10 ans" },
  { key: "15A", label: "15 ans" },
  { key: "20A", label: "20 ans" },
  { key: "30A", label: "30 ans" },
];

function formatDateLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function buildRows(dernier: any, precedent: any): string {
  return MATURITES.map((m) => {
    const a = precedent[m.key];
    const b = dernier[m.key];
    if (a == null || b == null) return "";
    const variationPbs = (b - a) * 100;
    const hausse = variationPbs >= 0;
    // Couleur inversée par rapport à une variation "classique" : une hausse
    // des taux fait baisser le prix des obligations (rouge), une baisse
    // des taux fait monter leur prix (vert) — même logique que sur le site.
    const color = hausse ? "#B4453D" : "#2E7D5B";
    const bg = hausse ? "#F5E7E5" : "#E4F0EA";
    const sign = hausse ? "+" : "−";
    return `<tr>
      <td style="padding:9px 12px;font-size:13px;color:#1C242C;border-bottom:1px solid #EEF0F2;">${m.label}</td>
      <td style="padding:9px 12px;font-size:13px;text-align:right;color:#5B6773;border-bottom:1px solid #EEF0F2;">${a.toFixed(3)}%</td>
      <td style="padding:9px 12px;font-size:13px;text-align:right;font-weight:600;color:#1C242C;border-bottom:1px solid #EEF0F2;">${b.toFixed(3)}%</td>
      <td style="padding:9px 12px;text-align:right;border-bottom:1px solid #EEF0F2;">
        <span style="display:inline-block;background:${bg};color:${color};font-weight:700;font-size:12px;padding:3px 9px;border-radius:12px;">${sign}${Math.abs(variationPbs).toFixed(1)} pbs</span>
      </td>
    </tr>`;
  }).join("");
}

function buildHtml(dernier: any, precedent: any): string {
  const dateLabel = formatDateLabel(dernier.date);
  const rows = precedent ? buildRows(dernier, precedent) : "";
  const tableBlock = precedent
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:6px;">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.04em;color:#5B6773;border-bottom:1px solid #DDE1E5;">Maturité</th>
            <th style="text-align:right;padding:8px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.04em;color:#5B6773;border-bottom:1px solid #DDE1E5;">Taux J-1</th>
            <th style="text-align:right;padding:8px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.04em;color:#5B6773;border-bottom:1px solid #DDE1E5;">Taux J</th>
            <th style="text-align:right;padding:8px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.04em;color:#5B6773;border-bottom:1px solid #DDE1E5;">Variation</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`
    : `<p style="font-size:13px;color:#5B6773;">Pas assez d'historique pour calculer une variation.</p>`;

  return `<!doctype html>
<html lang="fr"><head><meta charset="UTF-8"><title>Courbe des taux</title></head>
<body style="margin:0;padding:0;background:#FAFAF9;font-family:Arial,Helvetica,sans-serif;color:#1C242C;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#FAFAF9;">
  <tr><td style="background:#2B3A4A;padding:26px 30px;">
    <table role="presentation" width="100%"><tr>
      <td style="color:#fff;font-size:22px;font-weight:800;letter-spacing:0.5px;">COURBE DES TAUX</td>
      <td align="right">
        <div style="color:#fff;font-weight:700;font-size:14px;">BourseInfo<span style="color:#C9A24B;">.ma</span></div>
        <div style="color:#9AA6B0;font-size:11px;">Marchés financiers marocains</div>
      </td>
    </tr></table>
    <div style="color:#C9A24B;font-size:12px;margin-top:12px;letter-spacing:0.5px;">| MARCHÉ SECONDAIRE DES BONS DU TRÉSOR | ${dateLabel}</div>
  </td></tr>
  <tr><td style="padding:26px 30px 10px;">
    <div style="font-size:17px;font-weight:800;line-height:1.35;margin-bottom:12px;">Nouvelle courbe des taux publiée au ${dateLabel}</div>
    <p style="font-size:14px;line-height:1.65;color:#3a4550;margin:0 0 18px;">
      Les taux de référence du marché secondaire des bons du Trésor viennent d'être mis à jour sur BourseInfo.ma.
    </p>
    ${tableBlock}
    <a href="${SITE_URL}/obligataire/" style="display:inline-block;background:#C9A24B;color:#fff;text-decoration:none;font-weight:700;font-size:13px;padding:12px 22px;border-radius:6px;margin-top:22px;">
      Voir la page complète →
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

    // 1) Récupère la courbe complète depuis le site
    const curveRes = await fetch(CURVE_URL, { cache: "no-store" });
    if (!curveRes.ok) throw new Error("Impossible de charger courbe_taux.json");
    const curve: any[] = await curveRes.json();
    if (!curve || curve.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: "Aucune courbe disponible" }), { status: 200 });
    }

    // Tri défensif par date croissante, puis on prend les deux dernières séances
    const sorted = [...curve].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    const dernier = sorted[sorted.length - 1];
    const precedent = sorted.length > 1 ? sorted[sorted.length - 2] : null;

    // 2) Déjà envoyée ?
    const { data: sentRow } = await supabase
      .from("sent_courbes")
      .select("curve_date")
      .eq("curve_date", dernier.date)
      .maybeSingle();
    if (sentRow) {
      return new Response(
        JSON.stringify({ sent: 0, message: `Courbe du ${dernier.date} déjà envoyée, rien à faire.` }),
        { status: 200 }
      );
    }

    // 3) Récupère tous les utilisateurs inscrits
    let allEmails: string[] = [];
    let page = 1;
    while (true) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) throw error;
      allEmails.push(...data.users.map((u) => u.email).filter((e): e is string => !!e));
      if (data.users.length < 1000) break;
      page++;
    }

    // 4) Envoie l'email
    let sentCount = 0;
    if (allEmails.length > 0) {
      const html = buildHtml(dernier, precedent);
      const subject = `La courbe des taux au ${formatDateLabel(dernier.date)}`;
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

    await supabase.from("sent_courbes").insert({ curve_date: dernier.date, recipients_count: sentCount });

    return new Response(JSON.stringify({ sent: sentCount, curveDate: dernier.date }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
