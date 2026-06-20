-- Esquema de la base de datos para "Mensajes para Uber".
-- Ejecutar en Supabase → SQL Editor → New query → Run.

create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  content jsonb not null default '{}'::jsonb, -- { greeting, fields[], fragments[] }
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists templates_user_id_idx on public.templates (user_id);

-- Row Level Security: cada usuario solo accede a sus propias plantillas.
alter table public.templates enable row level security;

drop policy if exists "templates_select_own" on public.templates;
create policy "templates_select_own"
  on public.templates for select
  using (auth.uid() = user_id);

drop policy if exists "templates_insert_own" on public.templates;
create policy "templates_insert_own"
  on public.templates for insert
  with check (auth.uid() = user_id);

drop policy if exists "templates_update_own" on public.templates;
create policy "templates_update_own"
  on public.templates for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "templates_delete_own" on public.templates;
create policy "templates_delete_own"
  on public.templates for delete
  using (auth.uid() = user_id);
