-- ============================================================
-- CSATANGOLÓ FÓRUM CMS 1.0.1 – TELJES SUPABASE JAVÍTÓ SQL
-- Ezt futtasd le, ha az ellenőrző oldal piros hibákat mutat.
-- Újra lefuttatható. Nem törli a meglévő regisztrációkat.
-- ============================================================

create extension if not exists "pgcrypto";

create table if not exists registrations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  event_name text,
  event_date date,
  main_name text not null,
  email text not null,
  phone text not null,
  city text,
  companions jsonb default '[]'::jsonb,
  has_children text,
  children_details text,
  child_programs jsonb default '[]'::jsonb,
  accommodation text,
  demo_interest text,
  demo_details text,
  speaker_question text,
  question_for text,
  topics jsonb default '[]'::jsonb,
  roles jsonb default '[]'::jsonb,
  intro text,
  source text,
  privacy_accepted boolean default false,
  media_accepted boolean default false
);

create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  registration_id uuid references registrations(id) on delete cascade,
  participant_code text unique not null,
  name text not null,
  type text,
  email_contact text,
  phone_contact text,
  city text,
  checked_in boolean default false,
  checked_in_at timestamptz,
  contribution_paid boolean default false,
  note text
);

create table if not exists speakers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  subtitle text,
  bio text,
  topic text,
  image_url text,
  facebook_url text,
  website_url text,
  youtube_url text,
  sort_order integer default 100,
  is_featured boolean default false,
  is_published boolean default true
);

create table if not exists program_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  time_label text not null,
  title text not null,
  description text,
  speaker_name text,
  location text,
  sort_order integer default 100,
  is_published boolean default true
);

create table if not exists videos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  youtube_url text not null,
  description text,
  category text,
  sort_order integer default 100,
  is_published boolean default true
);

create table if not exists news (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  body text,
  is_published boolean default true
);

create table if not exists sponsors (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  logo_url text,
  website_url text,
  sort_order integer default 100,
  is_published boolean default true
);

create table if not exists gallery (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text,
  image_url text not null,
  description text,
  is_published boolean default true
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  file_url text not null,
  description text,
  is_published boolean default true
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('forum-assets', 'forum-assets', true, 52428800, null)
on conflict (id) do update
set public = true,
    file_size_limit = 52428800,
    allowed_mime_types = null;

alter table registrations enable row level security;
alter table participants enable row level security;
alter table speakers enable row level security;
alter table program_items enable row level security;
alter table videos enable row level security;
alter table news enable row level security;
alter table sponsors enable row level security;
alter table gallery enable row level security;
alter table documents enable row level security;

drop policy if exists "allow registration insert" on registrations;
drop policy if exists "allow registration select organizer" on registrations;
drop policy if exists "allow participant insert" on participants;
drop policy if exists "allow participant select admin" on participants;
drop policy if exists "allow participant update admin" on participants;

create policy "allow registration insert" on registrations for insert to anon with check (true);
create policy "allow registration select organizer" on registrations for select to anon using (true);
create policy "allow participant insert" on participants for insert to anon with check (true);
create policy "allow participant select admin" on participants for select to anon using (true);
create policy "allow participant update admin" on participants for update to anon using (true) with check (true);

drop policy if exists "cms public read speakers" on speakers;
drop policy if exists "cms public write speakers" on speakers;
drop policy if exists "cms public read program" on program_items;
drop policy if exists "cms public write program" on program_items;
drop policy if exists "cms public read videos" on videos;
drop policy if exists "cms public write videos" on videos;
drop policy if exists "cms public read news" on news;
drop policy if exists "cms public write news" on news;
drop policy if exists "cms public read sponsors" on sponsors;
drop policy if exists "cms public write sponsors" on sponsors;
drop policy if exists "cms public read gallery" on gallery;
drop policy if exists "cms public write gallery" on gallery;
drop policy if exists "cms public read documents" on documents;
drop policy if exists "cms public write documents" on documents;

create policy "cms public read speakers" on speakers for select to anon using (true);
create policy "cms public write speakers" on speakers for all to anon using (true) with check (true);
create policy "cms public read program" on program_items for select to anon using (true);
create policy "cms public write program" on program_items for all to anon using (true) with check (true);
create policy "cms public read videos" on videos for select to anon using (true);
create policy "cms public write videos" on videos for all to anon using (true) with check (true);
create policy "cms public read news" on news for select to anon using (true);
create policy "cms public write news" on news for all to anon using (true) with check (true);
create policy "cms public read sponsors" on sponsors for select to anon using (true);
create policy "cms public write sponsors" on sponsors for all to anon using (true) with check (true);
create policy "cms public read gallery" on gallery for select to anon using (true);
create policy "cms public write gallery" on gallery for all to anon using (true) with check (true);
create policy "cms public read documents" on documents for select to anon using (true);
create policy "cms public write documents" on documents for all to anon using (true) with check (true);

drop policy if exists "forum assets public read" on storage.objects;
drop policy if exists "forum assets public insert" on storage.objects;
drop policy if exists "forum assets public update" on storage.objects;
drop policy if exists "forum assets public delete" on storage.objects;

create policy "forum assets public read"
on storage.objects for select
to anon
using (bucket_id = 'forum-assets');

create policy "forum assets public insert"
on storage.objects for insert
to anon
with check (bucket_id = 'forum-assets');

create policy "forum assets public update"
on storage.objects for update
to anon
using (bucket_id = 'forum-assets')
with check (bucket_id = 'forum-assets');

create policy "forum assets public delete"
on storage.objects for delete
to anon
using (bucket_id = 'forum-assets');

create or replace function public.public_participant_count()
returns integer
language sql
security definer
set search_path = public
as $$
  select count(*)::integer from participants;
$$;

grant execute on function public.public_participant_count() to anon;

select 'Csatangoló Fórum CMS 1.0.1 javítás lefutott.' as status;
