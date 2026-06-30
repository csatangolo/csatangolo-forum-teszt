-- CSATANGOLÓ FÓRUM CMS 1.4 – Előadók szerkesztése + 3 bemutatkozó kép
-- Supabase SQL Editor → New query → Run
-- Újra lefuttatható, nem törli a meglévő adatokat.

alter table if exists speakers
  add column if not exists gallery_image_1_url text,
  add column if not exists gallery_image_2_url text,
  add column if not exists gallery_image_3_url text;

select 'CMS 1.4 előadói képek és szerkesztés mezők frissítve.' as status;
