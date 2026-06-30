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
