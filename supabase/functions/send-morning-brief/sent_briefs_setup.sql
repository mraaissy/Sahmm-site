-- À exécuter une seule fois dans Supabase : Project > SQL Editor > New query
-- Colle tout ce script, puis clique sur "Run".

-- Table qui garde une trace de chaque brief déjà envoyé par email, pour
-- éviter les doublons quand le robot tourne chaque jour.
create table if not exists sent_briefs (
  brief_date text primary key,
  sent_at timestamptz not null default now(),
  recipients_count integer
);
