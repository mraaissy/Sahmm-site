# Envoi automatique par email de la courbe des taux — Guide complet

Fonctionne exactement comme `send-morning-brief`, mais pour la courbe des
taux (marché secondaire des bons du Trésor) au lieu du Morning Brief.

## Comment ça fonctionne

1. Le robot va lire `public/data/courbe_taux.json` sur le site
2. Il regarde la **dernière date** du tableau (toujours la plus récente)
3. Il vérifie si cette date a déjà été envoyée (table `sent_courbes`)
4. Si c'est une **nouvelle courbe** → email à tous les inscrits, avec le
   tableau des 9 maturités (13 semaines à 30 ans) et la variation vs la
   séance précédente, exactement comme sur le site
5. Si c'est la **même que la dernière fois** (pas de nouvelle courbe ce
   jour-là — le cas le plus fréquent, la courbe n'étant mise à jour que
   ponctuellement) → ne fait rien, aucun email envoyé

**Votre seule tâche reste inchangée** : vous m'envoyez le fichier de la
courbe comme d'habitude. Je la publie sur le site (page d'accueil +
page Obligataire) ET dans `public/data/courbe_taux.json` en même temps.
Le robot s'occupe de l'email, tout seul.

---

## Étape 1 — Créer la table de suivi (une seule fois)

Dans Supabase → **SQL Editor** → **New query** → colle le contenu de
`sent_courbes_setup.sql` (inclus dans ce dossier) → **Run**.

## Étape 2 — Déployer la fonction (une seule fois)

Les secrets `RESEND_API_KEY` et `SUPABASE_SERVICE_ROLE_KEY` sont déjà
configurés si `send-morning-brief` est en place — inutile de les
reconfigurer.

```bash
npm install -g supabase
supabase login
supabase link --project-ref ctuskzfupoufgysuojrt
supabase functions deploy send-courbe-taux
```

## Étape 3 — Tester manuellement avant d'automatiser

Récupérez votre clé `service_role` (Supabase → Project Settings → API —
gardez-la strictement secrète), puis :

```bash
curl -X POST https://ctuskzfupoufgysuojrt.supabase.co/functions/v1/send-courbe-taux \
  -H "Authorization: Bearer VOTRE_SERVICE_ROLE_KEY"
```

Réponse attendue si une nouvelle courbe est envoyée :
```json
{"sent": 12, "curveDate": "2026-08-19"}
```

Si vous relancez la même commande juste après, vous devriez voir :
```json
{"sent": 0, "message": "Courbe du 2026-08-19 déjà envoyée, rien à faire."}
```
→ preuve que l'anti-doublon fonctionne.

## Étape 4 — Planifier une vérification automatique

Comme la courbe n'est mise à jour que ponctuellement (pas tous les
jours), deux options :

### Option A — Déclenchement manuel (le plus simple)

Juste après m'avoir envoyé une nouvelle courbe et l'avoir déployée sur
le site, lancez la commande de l'étape 3. L'email part immédiatement.
Aucune configuration supplémentaire n'est nécessaire.

### Option B — Vérification automatique quotidienne

Dans Supabase → **Database → Cron Jobs** (ou **Integrations → Cron**) →
**Create a new cron job** :

- **Name** : `send-courbe-taux-daily`
- **Schedule** : `0 8 * * 1-5` (tous les jours ouvrés à 8h00 UTC — ajustez
  selon l'heure à laquelle vous publiez habituellement la mise à jour)
- **Type** : HTTP Request
- **Method** : POST
- **URL** : `https://ctuskzfupoufgysuojrt.supabase.co/functions/v1/send-courbe-taux`
- **Headers** : `Authorization: Bearer VOTRE_SERVICE_ROLE_KEY`

Cliquez sur **Create**. Le robot vérifie chaque jour ouvré ; comme la
courbe ne change pas tous les jours, la plupart des exécutions ne feront
rien (grâce à l'anti-doublon) — c'est normal et sans risque.

#### Alternative si "Cron Jobs" n'existe pas dans votre interface

```sql
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'send-courbe-taux-daily',
  '0 8 * * 1-5',
  $$
  select net.http_post(
    url := 'https://ctuskzfupoufgysuojrt.supabase.co/functions/v1/send-courbe-taux',
    headers := jsonb_build_object('Authorization', 'Bearer VOTRE_SERVICE_ROLE_KEY')
  );
  $$
);
```

## Vérifier que ça fonctionne

- **Logs d'exécution** : Supabase → Edge Functions → send-courbe-taux → Logs
- **Historique des envois** : Table Editor → `sent_courbes` (une ligne par
  courbe envoyée, avec la date et le nombre de destinataires)
