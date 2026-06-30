-- CSATANGOLÓ FÓRUM – ADMIN ÉS BELÉPTETÉS FRISSÍTÉS
-- Supabase SQL Editor → New query → Run

alter table if exists registrations enable row level security;
alter table if exists participants enable row level security;

drop policy if exists "allow registration insert" on registrations;
drop policy if exists "allow participant insert" on participants;
drop policy if exists "allow participant select admin" on participants;
drop policy if exists "allow participant update admin" on participants;

create policy "allow registration insert"
on registrations
for insert
to anon
with check (true);

create policy "allow participant insert"
on participants
for insert
to anon
with check (true);

create policy "allow participant select admin"
on participants
for select
to anon
using (true);

create policy "allow participant update admin"
on participants
for update
to anon
using (true)
with check (true);

create or replace function public.public_participant_count()
returns integer
language sql
security definer
set search_path = public
as $$
  select count(*)::integer from participants;
$$;

grant execute on function public.public_participant_count() to anon;
