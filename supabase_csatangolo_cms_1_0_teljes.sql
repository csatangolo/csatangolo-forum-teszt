-- ============================================================
-- CSATANGOLÓ FÓRUM CMS 1.0 – TELJES SUPABASE FRISSÍTŐ
-- Ezt akkor futtasd le, ha bizonytalan vagy, hogy minden SQL lefutott-e.
-- Újra lefuttatható. Ne töröld kézzel a táblákat!
-- ============================================================


-- =============================
-- supabase_v8_tartalomkezelo.sql
-- =============================

-- CSATANGOLÓ FÓRUM – V8 TARTALOMKEZELŐ
-- Supabase SQL Editor → New query → Run

create extension if not exists "pgcrypto";

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

alter table speakers enable row level security;
alter table program_items enable row level security;
alter table videos enable row level security;
alter table news enable row level security;
alter table sponsors enable row level security;

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



-- =============================
-- supabase_v9_valodi_feltoltes.sql
-- =============================

-- CSATANGOLÓ FÓRUM – V9 VALÓDI FELTÖLTÉS + STORAGE
-- Supabase SQL Editor → New query → Run

create extension if not exists "pgcrypto";

insert into storage.buckets (id, name, public)
values ('forum-assets', 'forum-assets', true)
on conflict (id) do update set public = true;

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

alter table gallery enable row level security;
alter table documents enable row level security;

drop policy if exists "cms public read gallery" on gallery;
drop policy if exists "cms public write gallery" on gallery;
drop policy if exists "cms public read documents" on documents;
drop policy if exists "cms public write documents" on documents;

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



-- =============================
-- supabase_v10_egyszeru_kapu.sql
-- =============================

-- CSATANGOLÓ FÓRUM – V10 EGYSZERŰ KAPU
-- Ha a V6/V8/V9 jogosultságok már működnek, ezt nem muszáj lefuttatni.
-- Biztonság kedvéért lefuttatható.

alter table if exists participants enable row level security;

drop policy if exists "simple gate participant select" on participants;
drop policy if exists "simple gate participant update" on participants;

create policy "simple gate participant select"
on participants
for select
to anon
using (true);

create policy "simple gate participant update"
on participants
for update
to anon
using (true)
with check (true);
