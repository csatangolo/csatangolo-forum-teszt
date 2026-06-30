-- ============================================================
-- CSATANGOLÓ FÓRUM CMS – MASTER INSTALL V3
-- Tartalmazza az élményfeltöltést, YouTube beágyazást, alap asszisztenst kiszolgáló táblákat.
-- Újra lefuttatható. Nem törli a meglévő adatokat.
-- ============================================================

create extension if not exists "pgcrypto";

create table if not exists public.media_uploads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  uploader_name text,
  note text,
  file_url text,
  file_type text,
  is_approved boolean default false
);

alter table public.media_uploads enable row level security;

drop policy if exists "media uploads insert" on public.media_uploads;
drop policy if exists "media uploads read admin" on public.media_uploads;
drop policy if exists "media uploads update admin" on public.media_uploads;
drop policy if exists "media uploads delete admin" on public.media_uploads;

create policy "media uploads insert"
on public.media_uploads
for insert
to anon
with check (true);

create policy "media uploads read admin"
on public.media_uploads
for select
to anon
using (true);

create policy "media uploads update admin"
on public.media_uploads
for update
to anon
using (true)
with check (true);

create policy "media uploads delete admin"
on public.media_uploads
for delete
to anon
using (true);

-- Biztonság kedvéért a forum-assets bucket és jogosultságok is újra beállítva.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('forum-assets', 'forum-assets', true, 52428800, null)
on conflict (id) do update
set public = true,
    file_size_limit = 52428800,
    allowed_mime_types = null;

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

select 'CSATANGOLÓ MASTER INSTALL V3 – élményfeltöltés kész.' as status;
