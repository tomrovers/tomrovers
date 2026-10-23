-- Samen: database schema, access rules and functions.
-- Run this once in the Supabase SQL editor (or with `supabase db push`).

create extension if not exists pgcrypto;

-- A couple and its (at most two) members ---------------------------------------------------------

create table public.couples (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  created_at timestamptz not null default now()
);

create table public.couple_members (
  couple_id uuid not null references public.couples (id) on delete cascade,
  user_id uuid not null unique references auth.users (id) on delete cascade, -- one couple per person
  joined_at timestamptz not null default now(),
  primary key (couple_id, user_id)
);

-- Everything a couple does is an event ------------------------------------------------------------

create table public.events (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  author_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  -- public: both partners; sealed: partner sees it once both submitted the same seal_key; private: author only
  visibility text not null check (visibility in ('public', 'sealed', 'private')),
  seal_key text,
  created_at timestamptz not null default now(),
  check ((visibility = 'sealed') = (seal_key is not null))
);

create index events_couple_created on public.events (couple_id, created_at);
-- One sealed answer per question; After Dark wishes may be changed, the latest answer counts.
create unique index events_one_sealed_per_key on public.events (couple_id, author_id, seal_key) where visibility = 'sealed' and type <> 'ad.wish';

-- Helpers -----------------------------------------------------------------------------------------

create or replace function public.is_member(p_couple uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from couple_members where couple_id = p_couple and user_id = auth.uid());
$$;

-- Row level security ------------------------------------------------------------------------------

alter table public.couples enable row level security;
alter table public.couple_members enable row level security;
alter table public.events enable row level security;

create policy "members read their couple" on public.couples
  for select using (public.is_member(id));

create policy "members read their couple's members" on public.couple_members
  for select using (public.is_member(couple_id));

create policy "read public events and own events" on public.events
  for select using ((visibility = 'public' and public.is_member(couple_id)) or author_id = auth.uid());

create policy "members write their own events" on public.events
  for insert with check (author_id = auth.uid() and public.is_member(couple_id));

create policy "authors delete their own events" on public.events
  for delete using (author_id = auth.uid());

-- Sealed events of the partner, only once I submitted the same key myself -----------------------

create or replace function public.revealed_sealed_events(p_couple uuid)
returns setof public.events language sql stable security definer set search_path = public as $$
  select e.*
  from events e
  where e.couple_id = p_couple
    and public.is_member(p_couple)
    and e.visibility = 'sealed'
    and e.author_id <> auth.uid()
    and exists (
      select 1 from events mine
      where mine.couple_id = p_couple
        and mine.author_id = auth.uid()
        and mine.visibility = 'sealed'
        and mine.seal_key = e.seal_key
    );
$$;

-- Creating, joining and leaving a couple ---------------------------------------------------------

create or replace function public.create_couple()
returns public.couples language plpgsql security definer set search_path = public as $$
declare
  result couples;
  new_code text;
begin
  if auth.uid() is null then raise exception 'Niet ingelogd'; end if;
  if exists (select 1 from couple_members where user_id = auth.uid()) then
    raise exception 'Je bent al gekoppeld';
  end if;
  loop
    -- 6 characters without look-alikes such as 0/O and 1/I
    new_code := (
      select string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 1 + floor(random() * 32)::int, 1), '')
      from generate_series(1, 6)
    );
    exit when not exists (select 1 from couples where code = new_code);
  end loop;
  insert into couples (code) values (new_code) returning * into result;
  insert into couple_members (couple_id, user_id) values (result.id, auth.uid());
  return result;
end;
$$;

create or replace function public.join_couple(p_code text)
returns public.couples language plpgsql security definer set search_path = public as $$
declare
  result couples;
begin
  if auth.uid() is null then raise exception 'Niet ingelogd'; end if;
  if exists (select 1 from couple_members where user_id = auth.uid()) then
    raise exception 'Je bent al gekoppeld';
  end if;
  select * into result from couples where code = upper(trim(p_code)) for update;
  if not found then raise exception 'Deze code bestaat niet'; end if;
  if (select count(*) from couple_members where couple_id = result.id) >= 2 then
    raise exception 'Dit koppel is al compleet';
  end if;
  insert into couple_members (couple_id, user_id) values (result.id, auth.uid());
  return result;
end;
$$;

-- Leaving removes your own events; shared history of the partner stays theirs.
create or replace function public.leave_couple()
returns void language plpgsql security definer set search_path = public as $$
declare
  c uuid;
begin
  select couple_id into c from couple_members where user_id = auth.uid();
  if c is null then return; end if;
  delete from events where couple_id = c and author_id = auth.uid();
  delete from couple_members where couple_id = c and user_id = auth.uid();
  delete from couples where id = c and not exists (select 1 from couple_members where couple_id = c);
end;
$$;

-- Signed-in users only (anonymous sign-ins also get the authenticated role).
revoke execute on function public.create_couple(), public.join_couple(text), public.leave_couple(),
  public.revealed_sealed_events(uuid) from public, anon;
grant execute on function public.create_couple(), public.join_couple(text), public.leave_couple(),
  public.revealed_sealed_events(uuid) to authenticated;

-- Live updates ------------------------------------------------------------------------------------

alter publication supabase_realtime add table public.events, public.couple_members;
