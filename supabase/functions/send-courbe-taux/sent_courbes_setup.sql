-- À exécuter une seule fois dans Supabase : Project > SQL Editor > New query
-- Colle tout ce script, puis clique sur "Run".

-- Table qui garde une trace de chaque courbe des taux déjà envoyée par
-- email, pour éviter les doublons quand le robot tourne chaque jour (la
-- courbe n'est mise à jour que ponctuellement, pas quotidiennement).
create table if not exists sent_courbes (
  curve_date text primary key,
  sent_at timestamptz not null default now(),
  recipients_count integer
);
