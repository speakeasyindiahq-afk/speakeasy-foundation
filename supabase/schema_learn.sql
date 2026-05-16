-- Speakeasy India — Learn Hub additive schema.
-- Run in Supabase SQL editor. Safe to re-run.

alter table public.articles
  add column if not exists sub_category text,
  add column if not exists body text,
  add column if not exists body_hi text,
  add column if not exists sources jsonb default '[]'::jsonb,
  add column if not exists seo_title text,
  add column if not exists seo_title_hi text,
  add column if not exists seo_description text,
  add column if not exists seo_description_hi text,
  add column if not exists focus_keyword text,
  add column if not exists content_warning boolean default false,
  add column if not exists expert_id uuid references public.experts(id) on delete set null,
  add column if not exists review_date date,
  add column if not exists helpful_count int not null default 0,
  add column if not exists not_helpful_count int not null default 0,
  add column if not exists view_count int not null default 0;

create index if not exists articles_category_status_idx
  on public.articles(category, status, created_at desc);
create unique index if not exists articles_slug_unique on public.articles(slug);

alter table public.experts
  add column if not exists city text,
  add column if not exists bio text;

-- Allow anyone to read aggregate counts for published articles; updates
-- to helpful counts are permitted from any session for Phase 1 simplicity.
do $$ begin
  create policy "public update feedback counts" on public.articles
    for update using (status = 'published')
    with check (status = 'published');
exception when duplicate_object then null; end $$;