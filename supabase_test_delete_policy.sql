-- CSATANGOLÓ FÓRUM TESZT – RÉSZTVEVŐ TÖRLÉS JOGOSULTSÁG
-- Ezt a TESZT Supabase projektben futtasd le.
-- Újra lefuttatható. Nem töröl adatot.
-- Ha a participants tábla még nem létezik, létrehozza az alap mezőkkel.

create extension if not exists "pgcrypto";

create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now()
);

alter table public.participants
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

alter table public.participants enable row level security;

drop policy if exists "allow participant delete admin" on public.participants;
drop policy if exists "allow participant delete" on public.participants;
drop policy if exists "admin delete participants" on public.participants;
drop policy if exists "allow participant select admin" on public.participants;
drop policy if exists "allow participant update admin" on public.participants;
drop policy if exists "allow participant insert" on public.participants;

create policy "allow participant insert"
on public.participants
for insert
to anon
with check (true);

create policy "allow participant select admin"
on public.participants
for select
to anon
using (true);

create policy "allow participant update admin"
on public.participants
for update
to anon
using (true)
with check (true);

create policy "allow participant delete admin"
on public.participants
for delete
to anon
using (true);

select 'TESZT: participants jogosultságok beállítva, törlés engedélyezve.' as status;
