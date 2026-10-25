-- Samen: the couple's shared house layout.

create table public.couple_houses (
  couple_id uuid primary key references public.couples (id) on delete cascade,
  layout jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid default auth.uid() references auth.users (id) on delete set null
);

alter table public.couple_houses enable row level security;
grant select, insert, update on public.couple_houses to authenticated;

create policy "members read their house" on public.couple_houses
  for select using (public.is_member(couple_id));

create policy "members create their house" on public.couple_houses
  for insert with check (public.is_member(couple_id));

create policy "members change their house" on public.couple_houses
  for update using (public.is_member(couple_id)) with check (public.is_member(couple_id));

alter publication supabase_realtime add table public.couple_houses;
