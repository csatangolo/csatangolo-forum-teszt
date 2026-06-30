-- CSATANGOLÓ FÓRUM CMS 1.3 – ELŐADÓI MOTTÓ ÉS SZERKESZTHETŐ MEZŐK
-- Supabase SQL Editor → New query → Run
-- Újra lefuttatható, nem törli a meglévő adatokat.

alter table if exists speakers
  add column if not exists motto text,
  add column if not exists instagram_url text;

-- Ezeket is biztosítjuk, ha régebbi speakers tábla jött létre:
alter table if exists speakers
  add column if not exists facebook_url text,
  add column if not exists website_url text,
  add column if not exists youtube_url text,
  add column if not exists subtitle text,
  add column if not exists bio text,
  add column if not exists topic text,
  add column if not exists image_url text,
  add column if not exists sort_order integer default 100,
  add column if not exists is_featured boolean default false,
  add column if not exists is_published boolean default true;

select 'CMS 1.3 előadói mezők frissítve.' as status;
