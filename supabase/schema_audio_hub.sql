-- Prompt 6 — Audio Hub schema extension
-- Safe to run multiple times. Extends existing audio_episodes from schema.sql.

create extension if not exists pgcrypto;

alter table public.audio_episodes
  add column if not exists slug text,
  add column if not exists description_hi text,
  add column if not exists transcript_en text,
  add column if not exists transcript_hi text,
  add column if not exists category text,
  add column if not exists language text default 'en',
  add column if not exists duration_seconds int,
  add column if not exists expert_id uuid references public.experts(id) on delete set null,
  add column if not exists seo_title text,
  add column if not exists seo_title_hi text,
  add column if not exists seo_description text,
  add column if not exists seo_description_hi text,
  add column if not exists play_count bigint not null default 0,
  add column if not exists updated_at timestamptz not null default now();

do $$ begin
  alter table public.audio_episodes add constraint audio_episodes_slug_key unique (slug);
exception when duplicate_object then null; when duplicate_table then null; end $$;

create index if not exists audio_episodes_status_created_idx
  on public.audio_episodes (status, created_at desc);
create index if not exists audio_episodes_category_idx
  on public.audio_episodes (category);

-- RLS (table already has RLS enabled + public read-published policy from schema.sql)
alter table public.audio_episodes enable row level security;
do $$ begin
  create policy "public read published audio v2" on public.audio_episodes
    for select using (status = 'published');
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "auth write audio v2" on public.audio_episodes
    for all to authenticated using (true) with check (true);
exception when duplicate_object then null; end $$;

-- Public increment play_count (safe, single column)
create or replace function public.increment_audio_play(_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.audio_episodes set play_count = coalesce(play_count, 0) + 1 where id = _id;
$$;
grant execute on function public.increment_audio_play(uuid) to anon, authenticated;

-- Storage bucket: audio (public read, admin upload)
insert into storage.buckets (id, name, public)
values ('audio', 'audio', true)
on conflict (id) do update set public = true;

do $$ begin
  create policy "Public read audio bucket" on storage.objects
    for select using (bucket_id = 'audio');
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Auth upload audio bucket" on storage.objects
    for insert to authenticated with check (bucket_id = 'audio');
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Auth update audio bucket" on storage.objects
    for update to authenticated using (bucket_id = 'audio');
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Auth delete audio bucket" on storage.objects
    for delete to authenticated using (bucket_id = 'audio');
exception when duplicate_object then null; end $$;