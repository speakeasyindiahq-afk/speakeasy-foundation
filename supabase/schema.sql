-- Speakeasy India — run this in your Supabase SQL editor.
-- Safe to run multiple times.

create extension if not exists pgcrypto;

create table if not exists public.site_settings (
  key text primary key,
  value jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  title text not null,
  title_hi text,
  excerpt text,
  excerpt_hi text,
  cover_url text,
  category text,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

create table if not exists public.myths (
  id uuid primary key default gen_random_uuid(),
  myth text not null,
  myth_hi text,
  fact text not null,
  fact_hi text,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

create table if not exists public.audio_episodes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  title_hi text,
  description text,
  duration_minutes int,
  audio_url text,
  cover_url text,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

create table if not exists public.experts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  credentials text,
  avatar_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- RLS: anonymous read of published content; admin writes via service role / authed user.
alter table public.site_settings enable row level security;
alter table public.articles enable row level security;
alter table public.myths enable row level security;
alter table public.audio_episodes enable row level security;
alter table public.experts enable row level security;

do $$ begin
  create policy "public read site_settings" on public.site_settings for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "auth write site_settings" on public.site_settings for all to authenticated using (true) with check (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "public read published articles" on public.articles for select using (status = 'published');
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "auth write articles" on public.articles for all to authenticated using (true) with check (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "public read published myths" on public.myths for select using (status = 'published');
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "auth write myths" on public.myths for all to authenticated using (true) with check (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "public read published audio" on public.audio_episodes for select using (status = 'published');
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "auth write audio" on public.audio_episodes for all to authenticated using (true) with check (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "public read active experts" on public.experts for select using (active = true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "auth write experts" on public.experts for all to authenticated using (true) with check (true);
exception when duplicate_object then null; end $$;

-- Seed defaults
insert into public.site_settings (key, value) values
  ('hero_title_hi', '"ईमानदार जवाब। बिना शर्म, बिना निर्णय।"'),
  ('hero_title_en', '"Honest answers. No shame, no judgement."'),
  ('hero_subtitle_hi', '"भारत के लिए चिकित्सकीय रूप से समीक्षित यौन कल्याण शिक्षा।"'),
  ('hero_subtitle_en', '"Medically-reviewed sexual wellness education for India."'),
  ('whatsapp_channel_url', '"https://whatsapp.com/channel/your-channel"'),
  ('featured_article_ids', '[]'::jsonb),
  ('myth_of_week_id', 'null'::jsonb)
on conflict (key) do nothing;