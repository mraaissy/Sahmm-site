# Envoi automatique par email des Morning Briefs / Weekly — Guide complet

## Comment ça fonctionne

Chaque jour à heure fixe, un robot :
1. Va lire `public/data/morning_briefs.json` sur le site
2. Regarde le **premier élément** du tableau (toujours le plus récent)
3. Vérifie s'il a déjà été envoyé (table `sent_briefs`)
4. Si c'est un **nouveau brief** → l'envoie par email à tous les inscrits
5. Si c'est le **même qu'hier** (pas de nouveau brief ce jour-là, ex. weekend) → ne fait rien, aucun email envoyé

**Votre seule tâche reste inchangée** : vous m'envoyez le brief du jour comme d'habitude. Je l'ajoute au site ET à `morning_briefs.json` en même temps. Le robot s'occupe du reste, tout seul, chaque matin.

---

## Étape 1 — Créer la table de suivi (une seule fois)

Dans Supabase → **SQL Editor** → **New query** → colle le contenu de
`sent_briefs_setup.sql` (inclus dans ce dossier) → **Run**.

## Étape 2 — Déployer la fonction (une seule fois)

```bash
npm install -g supabase
supabase login
supabase link --project-ref ctuskzfupoufgysuojrt
supabase secrets set RESEND_API_KEY=re_votre_cle_ici
supabase functions deploy send-morning-brief
```

## Étape 3 — Tester manuellement avant d'automatiser

Récupérez votre clé `service_role` (Supabase → Project Settings → API —
gardez-la strictement secrète), puis :

```bash
curl -X POST https://ctuskzfupoufgysuojrt.supabase.co/functions/v1/send-morning-brief \
  -H "Authorization: Bearer VOTRE_SERVICE_ROLE_KEY"
```

Réponse attendue si un nouveau brief est envoyé :
```json
{"sent": 12, "total": 12, "brief": "2026-08-13"}
```

Si vous relancez la même commande juste après, vous devriez voir :
```json
{"sent": 0, "message": "Brief du 2026-08-13 déjà envoyé, rien à faire."}
```
→ preuve que l'anti-doublon fonctionne.

## Étape 4 — Planifier l'envoi automatique chaque matin

Dans Supabase → **Database → Cron Jobs** (ou **Integrations → Cron**) →
**Create a new cron job** :

- **Name** : `send-morning-brief-daily`
- **Schedule** : `0 7 * * 1-5` (tous les jours ouvrés à 7h00 UTC, ajustez
  selon l'heure à laquelle vous publiez habituellement le brief)
- **Type** : HTTP Request
- **Method** : POST
- **URL** : `https://ctuskzfupoufgysuojrt.supabase.co/functions/v1/send-morning-brief`
- **Headers** : `Authorization: Bearer VOTRE_SERVICE_ROLE_KEY`

Cliquez sur **Create**. C'est terminé.

### Alternative si "Cron Jobs" n'existe pas dans votre interface

```sql
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'send-morning-brief-daily',
  '0 7 * * 1-5',
  $$
  select net.http_post(
    url := 'https://ctuskzfupoufgysuojrt.supabase.co/functions/v1/send-morning-brief',
    headers := jsonb_build_object('Authorization', 'Bearer VOTRE_SERVICE_ROLE_KEY')
  );
  $$
);
```

## Vérifier que ça fonctionne

- **Logs d'exécution** : Supabase → Edge Functions → send-morning-brief → Logs
- **Historique des envois** : Table Editor → `sent_briefs` (une ligne par brief envoyé, avec la date et le nombre de destinataires)
