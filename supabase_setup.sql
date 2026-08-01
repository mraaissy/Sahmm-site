-- À exécuter une seule fois dans Supabase : Project > SQL Editor > New query
-- Colle tout ce script, puis clique sur "Run".

-- 1) Table qui stocke les lignes de portefeuille de chaque utilisateur
create table if not exists portfolio_holdings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code text not null,
  nom text not null,
  quantite numeric not null check (quantite > 0),
  prix_achat numeric not null check (prix_achat > 0),
  created_at timestamptz not null default now()
);

-- 2) Active la sécurité au niveau des lignes (chaque utilisateur ne voit QUE ses données)
alter table portfolio_holdings enable row level security;

-- 3) Règles : un utilisateur connecté peut lire/ajouter/supprimer uniquement ses propres lignes
create policy "Lire ses propres lignes"
  on portfolio_holdings for select
  using (auth.uid() = user_id);

create policy "Ajouter ses propres lignes"
  on portfolio_holdings for insert
  with check (auth.uid() = user_id);

create policy "Supprimer ses propres lignes"
  on portfolio_holdings for delete
  using (auth.uid() = user_id);

-- (Optionnel) index pour accélérer les requêtes par utilisateur
create index if not exists portfolio_holdings_user_id_idx on portfolio_holdings(user_id);
