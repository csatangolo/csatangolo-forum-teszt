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
