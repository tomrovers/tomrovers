-- Samen: After Dark answers only reach the partner when they match.
-- A nee, a low spark or your exact answer to an Afstemmen question never leaves the server.

-- How two Afstemmen answers compare. Keep in sync with alignQuestions in src/lib/afterdark.ts.
create or replace function public.align_of(p_question text, a int, b int)
returns text language sql immutable set search_path = '' as $$
  select case
    when p_question = 'initiatief' then case when a + b = 2 then 'samen' when a + b < 2 then 'dichtbij' else 'verschil' end
    when p_question = 'erna' then case when a = b or a = 3 or b = 3 then 'samen' else 'verschil' end
    else case when a = b then 'samen' when abs(a - b) = 1 then 'dichtbij' else 'verschil' end
  end;
$$;

-- Sealed events of the partner, once I answered the same question myself. After Dark answers may
-- change, so the latest one per question counts, and they are only revealed as far as they match.
create or replace function public.revealed_sealed_events(p_couple uuid)
returns setof public.events language sql stable security definer set search_path = public as $$
  with latest as (
    select distinct on (author_id, seal_key) *
    from events
    where couple_id = p_couple and visibility = 'sealed' and public.is_member(p_couple)
    order by author_id, seal_key, created_at desc
  ),
  pairs as (
    select theirs.*, mine.payload as my_payload
    from latest theirs
    join latest mine on mine.seal_key = theirs.seal_key and mine.author_id = auth.uid()
    where theirs.author_id <> auth.uid()
  )
  select id, couple_id, author_id, type,
    case type
      -- Only "you both feel like it" (2) or "you both really do" (3), never the number itself.
      when 'ad.spark' then jsonb_set(payload, '{level}',
        to_jsonb(case when least((payload->>'level')::int, (my_payload->>'level')::int) >= 3 then 3 else 2 end))
      -- How your answers compare instead of the answer.
      when 'ad.align' then jsonb_build_object('questionId', payload->>'questionId',
        'alignment', public.align_of(payload->>'questionId', (my_payload->>'answer')::int, (payload->>'answer')::int))
      else payload
    end,
    visibility, seal_key, created_at
  from pairs
  where type not like 'ad.%'
    or type = 'ad.align'
    or (type = 'ad.wish' and payload->>'answer' in ('ja', 'misschien') and my_payload->>'answer' in ('ja', 'misschien'))
    or (type = 'ad.spark' and (payload->>'level')::int >= 2 and (my_payload->>'level')::int >= 2);
$$;

revoke execute on function public.align_of(text, int, int) from public, anon, authenticated;

-- The helper Supabase adds for "automatic RLS" is not meant to be called through the API.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end $$;
