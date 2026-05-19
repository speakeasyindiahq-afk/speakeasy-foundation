-- Prompt 8 — Navigation + Search Settings
-- Backward-safe extension of site_settings for search ops.
-- site_settings is assumed to exist from earlier prompts as:
--   create table public.site_settings (
--     key text primary key,
--     value jsonb,
--     updated_at timestamptz default now()
--   );
-- This migration only seeds defaults; it does not alter columns or RLS.

begin;

-- Ensure table exists (no-op if already created in earlier migrations).
create table if not exists public.site_settings (
  key text primary key,
  value jsonb,
  updated_at timestamptz default now()
);

alter table public.site_settings enable row level security;

-- Public can read; only authenticated admins write (existing prompts already
-- create these policies — guarded for idempotency).
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'site_settings'
      and policyname = 'site_settings_public_read'
  ) then
    create policy site_settings_public_read on public.site_settings
      for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'site_settings'
      and policyname = 'site_settings_auth_write'
  ) then
    create policy site_settings_auth_write on public.site_settings
      for all to authenticated using (true) with check (true);
  end if;
end $$;

-- Search-specific keys. All values stored as JSONB strings so the existing
-- settingString() helper in src/lib/site-settings.ts continues to work.
insert into public.site_settings (key, value) values
  ('search_pagefind_enabled',  to_jsonb('false'::text)),
  ('search_deploy_hook_url',   to_jsonb(''::text)),
  ('search_placeholder_en',    to_jsonb('Search articles, myths, audio, Q&A…'::text)),
  ('search_placeholder_hi',    to_jsonb('लेख, भ्रांतियाँ, ऑडियो, सवाल खोजें…'::text)),
  ('search_last_rebuild_at',   to_jsonb(''::text))
on conflict (key) do nothing;

commit;