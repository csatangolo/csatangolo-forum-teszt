-- CSATANGOLÓ FÓRUM CMS – MASTER INSTALL V3.0
-- Újra lefuttatható. Nem törli a meglévő adatokat.
create extension if not exists "pgcrypto";
create table if not exists public.media_uploads (id uuid primary key default gen_random_uuid(),created_at timestamptz default now(),uploader_name text,note text,file_url text,file_type text,is_approved boolean default false);
create table if not exists public.support_offers (id uuid primary key default gen_random_uuid(),created_at timestamptz default now(),supporter_name text,email text,phone text,support_type text,amount_text text,support_details text,logo_url text,anonymous boolean default false,public_display boolean default false,status text default 'pending',admin_note text);
create table if not exists public.email_templates (id uuid primary key default gen_random_uuid(),created_at timestamptz default now(),template_key text unique,subject text,body text,is_enabled boolean default true);
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types) values ('forum-assets','forum-assets',true,52428800,null) on conflict (id) do update set public=true,file_size_limit=52428800,allowed_mime_types=null;
alter table public.media_uploads enable row level security; alter table public.support_offers enable row level security; alter table public.email_templates enable row level security;
drop policy if exists "media uploads all" on public.media_uploads; create policy "media uploads all" on public.media_uploads for all to anon using (true) with check (true);
drop policy if exists "support offers all" on public.support_offers; create policy "support offers all" on public.support_offers for all to anon using (true) with check (true);
drop policy if exists "email templates all" on public.email_templates; create policy "email templates all" on public.email_templates for all to anon using (true) with check (true);
drop policy if exists "forum assets public read" on storage.objects; drop policy if exists "forum assets public insert" on storage.objects; drop policy if exists "forum assets public update" on storage.objects; drop policy if exists "forum assets public delete" on storage.objects;
create policy "forum assets public read" on storage.objects for select to anon using (bucket_id='forum-assets');
create policy "forum assets public insert" on storage.objects for insert to anon with check (bucket_id='forum-assets');
create policy "forum assets public update" on storage.objects for update to anon using (bucket_id='forum-assets') with check (bucket_id='forum-assets');
create policy "forum assets public delete" on storage.objects for delete to anon using (bucket_id='forum-assets');
select 'CSATANGOLÓ MASTER INSTALL V3.0 SIKERESEN LEFUTOTT!' as status;
