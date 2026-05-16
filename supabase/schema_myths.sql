-- Speakeasy India — Myth Hub additive schema. Safe to re-run.

alter table public.myths
  add column if not exists slug text,
  add column if not exists category text,
  add column if not exists myth_statement_hi text,
  add column if not exists myth_statement_en text,
  add column if not exists truth_statement_hi text,
  add column if not exists truth_statement_en text,
  add column if not exists explanation_hi text,
  add column if not exists explanation_en text,
  add column if not exists expert_id uuid references public.experts(id) on delete set null,
  add column if not exists seo_title_en text,
  add column if not exists seo_title_hi text,
  add column if not exists seo_description_en text,
  add column if not exists seo_description_hi text,
  add column if not exists updated_at timestamptz not null default now();

-- Backfill from legacy columns where new ones are null
update public.myths
  set myth_statement_en = coalesce(myth_statement_en, myth),
      myth_statement_hi = coalesce(myth_statement_hi, myth_hi),
      truth_statement_en = coalesce(truth_statement_en, fact),
      truth_statement_hi = coalesce(truth_statement_hi, fact_hi)
  where myth_statement_en is null or truth_statement_en is null;

create unique index if not exists myths_slug_unique on public.myths(slug) where slug is not null;
create index if not exists myths_category_status_idx on public.myths(category, status, created_at desc);