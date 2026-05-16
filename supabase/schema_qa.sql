-- Speakeasy India — Anonymous Q&A schema. Safe to re-run.

create table if not exists public.qa_submissions (
  id uuid primary key default gen_random_uuid(),
  question_en text,
  question_hi text,
  answer_en text,
  answer_hi text,
  topic_category text,
  language text not null default 'en' check (language in ('en','hi')),
  age_confirmed boolean not null default false,
  status text not null default 'pending' check (status in ('pending','approved','published','rejected')),
  expert_id uuid references public.experts(id) on delete set null,
  moderation_notes text,
  seo_slug text,
  seo_title_en text,
  seo_title_hi text,
  seo_description_en text,
  seo_description_hi text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  published_at timestamptz,
  constraint qa_has_question check (
    coalesce(length(btrim(question_en)),0) > 0 or coalesce(length(btrim(question_hi)),0) > 0
  )
);

create unique index if not exists qa_seo_slug_unique
  on public.qa_submissions(seo_slug) where seo_slug is not null;
create index if not exists qa_status_published_idx
  on public.qa_submissions(status, published_at desc);
create index if not exists qa_category_idx
  on public.qa_submissions(topic_category, status);

alter table public.qa_submissions enable row level security;

-- Anonymous public users can INSERT pending questions only
drop policy if exists "qa anon insert" on public.qa_submissions;
create policy "qa anon insert"
  on public.qa_submissions
  for insert
  to anon, authenticated
  with check (
    status = 'pending'
    and age_confirmed = true
    and answer_en is null
    and answer_hi is null
    and expert_id is null
    and published_at is null
    and reviewed_at is null
  );

-- Public users can only read PUBLISHED rows
drop policy if exists "qa public read published" on public.qa_submissions;
create policy "qa public read published"
  on public.qa_submissions
  for select
  to anon, authenticated
  using (status = 'published');

-- Authenticated admins (any signed-in admin user) — full access for moderation
drop policy if exists "qa admin all" on public.qa_submissions;
create policy "qa admin all"
  on public.qa_submissions
  for all
  to authenticated
  using (true)
  with check (true);
