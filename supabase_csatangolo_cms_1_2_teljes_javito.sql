-- ============================================================
-- CSATANGOLÓ FÓRUM CMS 1.2 – SUPABASE TELJES JAVÍTÓ SQL
-- Ezt futtasd le, ha az ellenőrző oldal hiányzó táblákat jelez.
-- Újra lefuttatható. Nem törli a meglévő regisztrációkat.
-- ============================================================

create extension if not exists "pgcrypto";

create table if not exists registrations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now()
);

alter table registrations
  add column if not exists event_name text,
  add column if not exists event_date date,
  add column if not exists main_name text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists city text,
  add column if not exists companions jsonb default '[]'::jsonb,
  add column if not exists has_children text,
  add column if not exists children_details text,
  add column if not exists child_programs jsonb default '[]'::jsonb,
  add column if not exists accommodation text,
  add column if not exists demo_interest text,
  add column if not exists demo_details text,
  add column if not exists speaker_question text,
  add column if not exists question_for text,
  add column if not exists topics jsonb default '[]'::jsonb,
  add column if not exists roles jsonb default '[]'::jsonb,
  add column if not exists intro text,
  add column if not exists source text,
  add column if not exists privacy_accepted boolean default false,
  add column if not exists media_accepted boolean default false;

create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now()
);

alter table participants
  add column if not exists registration_id uuid,
  add column if not exists participant_code text,
  add column if not exists name text,
  add column if not exists type text,
  add column if not exists email_contact text,
  add column if not exists phone_contact text,
  add column if not exists city text,
  add column if not exists checked_in boolean default false,
  add column if not exists checked_in_at timestamptz,
  add column if not exists contribution_paid boolean default false,
  add column if not exists note text;

create unique index if not exists participants_code_unique on participants(participant_code);

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

create policy "forum assets public read" on storage.objects for select to anon using (bucket_id = 'forum-assets');
create policy "forum assets public insert" on storage.objects for insert to anon with check (bucket_id = 'forum-assets');
create policy "forum assets public update" on storage.objects for update to anon using (bucket_id = 'forum-assets') with check (bucket_id = 'forum-assets');
create policy "forum assets public delete" on storage.objects for delete to anon using (bucket_id = 'forum-assets');

create or replace function public.public_participant_count()
returns integer
language sql
security definer
set search_path = public
as $$
  select count(*)::integer from participants;
$$;

grant execute on function public.public_participant_count() to anon;

select 'Csatangoló Fórum CMS 1.2 javítás lefutott.' as status;
