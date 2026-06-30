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
