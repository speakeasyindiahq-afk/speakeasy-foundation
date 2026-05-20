-- Speakeasy India — Phase 1 Admin Operations schema. Safe to re-run.

-- Role readiness (admin / editor) — separate from profile data.
do $$ begin
  create type public.admin_role as enum ('admin','editor');
exception when duplicate_object then null; end $$;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.admin_role not null default 'admin',
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

drop policy if exists "admin_users self read" on public.admin_users;
create policy "admin_users self read"
  on public.admin_users for select to authenticated
  using (user_id = auth.uid());

create or replace function public.has_admin_role(_user_id uuid, _role public.admin_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = _user_id and role = _role)
$$;

create or replace function public.is_admin(_user_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = _user_id)
$$;

-- Audit log of important admin actions.
create table if not exists public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  actor_email text,
  action text not null,                 -- publish / archive / hide / emergency_hide / trust_update / moderate / seo_update
  entity_type text,                     -- article / myth / audio / qa / trust / settings
  entity_id text,
  reason text,
  severity text not null default 'info' check (severity in ('info','warning','critical')),
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_logs_created_idx on public.admin_logs(created_at desc);
create index if not exists admin_logs_entity_idx on public.admin_logs(entity_type, entity_id);

alter table public.admin_logs enable row level security;

drop policy if exists "admin_logs auth read" on public.admin_logs;
create policy "admin_logs auth read"
  on public.admin_logs for select to authenticated using (true);

drop policy if exists "admin_logs auth insert" on public.admin_logs;
create policy "admin_logs auth insert"
  on public.admin_logs for insert to authenticated with check (true);

-- Unified status architecture: ensure new statuses are allowed across content tables.
-- Backward-safe: only adds/refreshes CHECK constraints, never alters data.
do $$ begin
  alter table public.articles drop constraint if exists articles_status_check;
  alter table public.articles add constraint articles_status_check
    check (status in ('draft','published','archived','hidden'));
exception when undefined_table then null; end $$;

do $$ begin
  alter table public.myths drop constraint if exists myths_status_check;
  alter table public.myths add constraint myths_status_check
    check (status in ('draft','published','archived','hidden'));
exception when undefined_table then null; end $$;

do $$ begin
  alter table public.audio_episodes drop constraint if exists audio_episodes_status_check;
  alter table public.audio_episodes add constraint audio_episodes_status_check
    check (status in ('draft','published','archived','hidden'));
exception when undefined_table then null; end $$;

-- Tracking columns
alter table public.articles       add column if not exists updated_at timestamptz default now();
alter table public.myths          add column if not exists updated_at timestamptz default now();
alter table public.audio_episodes add column if not exists updated_at timestamptz default now();
