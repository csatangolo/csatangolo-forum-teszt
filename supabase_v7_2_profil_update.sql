-- CSATANGOLÓ FÓRUM – V7.2 PROFIL FRISSÍTÉS
-- Supabase SQL Editor → New query → Run
-- Ha a V6 már futott, ez nem feltétlen szükséges, de biztonságosan lefuttatható.

alter table if exists participants enable row level security;

drop policy if exists "allow participant profile select" on participants;

create policy "allow participant profile select"
on participants
for select
to anon
using (true);
