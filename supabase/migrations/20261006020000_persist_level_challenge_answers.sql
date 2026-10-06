create table if not exists public.user_challenge_attempts (
  user_id uuid not null references public.profiles(id) on delete cascade,
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  selected_answer integer not null,
  correct boolean not null,
  explanation text,
  xp_awarded integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (user_id, challenge_id)
);

alter table public.user_challenge_attempts enable row level security;

revoke update on table public.profiles from public, anon, authenticated;
revoke update (total_xp, level, coins) on table public.profiles from public, anon, authenticated;
grant update (id, username, avatar_url) on table public.profiles to authenticated;
revoke select on table public.challenges from public, anon, authenticated;
grant select (id, level_id, challenge_number, type, prompt, options, xp_reward)
  on table public.challenges to authenticated;
revoke all on table public.user_challenge_attempts from public, anon, authenticated;
grant select on table public.user_challenge_attempts to authenticated;

drop policy if exists "challenge attempts self read" on public.user_challenge_attempts;
create policy "challenge attempts self read"
  on public.user_challenge_attempts for select
  using (auth.uid() = user_id);

create or replace function public.submit_challenge_answer(p_challenge_id uuid, p_answer integer)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  acting_user_id uuid := auth.uid();
  challenge_row record;
  previous_attempt public.user_challenge_attempts%rowtype;
  current_xp integer;
  current_coins integer;
  new_xp integer;
  new_level integer;
  option_count integer;
  xp_award integer;
  total_challenges integer;
  answered_challenges integer;
  is_complete boolean;
  completed_at_value timestamptz;
begin
  if acting_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select p.total_xp, p.coins
  into current_xp, current_coins
  from public.profiles as p
  where p.id = acting_user_id
  for update;
  if not found then
    raise exception 'Player profile not found' using errcode = 'P0002';
  end if;

  select c.id, c.level_id, c.answer, c.explanation, c.xp_reward, c.options,
         l.world_id, l.level_number
  into challenge_row
  from public.challenges as c
  join public.levels as l on l.id = c.level_id
  where c.id = p_challenge_id and l.is_active = true;
  if not found then
    raise exception 'Challenge not found' using errcode = 'P0002';
  end if;
  if pg_catalog.jsonb_typeof(challenge_row.options) is distinct from 'array' then
    raise exception 'Challenge options must be a JSON array';
  end if;

  option_count := pg_catalog.jsonb_array_length(challenge_row.options);
  if p_answer < 0 or p_answer >= option_count then
    raise exception 'Selected answer is outside the available choices';
  end if;

  select a.*
  into previous_attempt
  from public.user_challenge_attempts as a
  where a.user_id = acting_user_id and a.challenge_id = p_challenge_id;
  if found then
    select pg_catalog.count(*)::integer
    into total_challenges
    from public.challenges as c
    where c.level_id = challenge_row.level_id;
    select pg_catalog.count(*)::integer
    into answered_challenges
    from public.user_challenge_attempts as a
    join public.challenges as c on c.id = a.challenge_id
    where a.user_id = acting_user_id and c.level_id = challenge_row.level_id;
    select p.status = 'completed', p.completed_at
    into is_complete, completed_at_value
    from public.user_progress as p
    where p.user_id = acting_user_id
      and p.world_id = challenge_row.world_id
      and p.level_number = challenge_row.level_number;
    select p.total_xp, p.level, p.coins
    into new_xp, new_level, current_coins
    from public.profiles as p
    where p.id = acting_user_id;

    return pg_catalog.jsonb_build_object(
      'challenge_id', p_challenge_id,
      'selected_answer', previous_attempt.selected_answer,
      'correct', previous_attempt.correct,
      'explanation', previous_attempt.explanation,
      'xp_awarded', 0,
      'already_answered', true,
      'completed', coalesce(is_complete, false) or (total_challenges > 0 and answered_challenges >= total_challenges),
      'profile', pg_catalog.jsonb_build_object('total_xp', new_xp, 'level', new_level, 'coins', current_coins)
    );
  end if;

  if challenge_row.answer is null then
    raise exception 'Challenge answer is not configured';
  end if;

  xp_award := case
    when challenge_row.answer = pg_catalog.to_jsonb(p_answer)
      then greatest(challenge_row.xp_reward, 0)
    else 0
  end;
  new_xp := current_xp + xp_award;
  new_level := pg_catalog.floor(new_xp::numeric / 600)::integer + 1;

  insert into public.user_challenge_attempts (
    user_id, challenge_id, selected_answer, correct, explanation, xp_awarded
  ) values (
    acting_user_id, p_challenge_id, p_answer,
    challenge_row.answer = pg_catalog.to_jsonb(p_answer),
    challenge_row.explanation, xp_award
  );

  update public.profiles as p
  set total_xp = new_xp, level = new_level
  where p.id = acting_user_id;

  select pg_catalog.count(*)::integer
  into total_challenges
  from public.challenges as c
  where c.level_id = challenge_row.level_id;
  select pg_catalog.count(*)::integer
  into answered_challenges
  from public.user_challenge_attempts as a
  join public.challenges as c on c.id = a.challenge_id
  where a.user_id = acting_user_id and c.level_id = challenge_row.level_id;

  is_complete := total_challenges > 0 and answered_challenges >= total_challenges;
  completed_at_value := case when is_complete then pg_catalog.now() else null end;
  insert into public.user_progress (user_id, world_id, level_number, status, completed_at)
  values (
    acting_user_id, challenge_row.world_id, challenge_row.level_number,
    case when is_complete then 'completed' else 'in_progress' end,
    completed_at_value
  )
  on conflict (user_id, world_id, level_number) do update
  set status = case
        when public.user_progress.status = 'completed' then 'completed'
        else excluded.status
      end,
      completed_at = coalesce(public.user_progress.completed_at, excluded.completed_at);

  return pg_catalog.jsonb_build_object(
    'challenge_id', p_challenge_id,
    'selected_answer', p_answer,
    'correct', challenge_row.answer = pg_catalog.to_jsonb(p_answer),
    'explanation', challenge_row.explanation,
    'xp_awarded', xp_award,
    'already_answered', false,
    'completed', is_complete,
    'profile', pg_catalog.jsonb_build_object('total_xp', new_xp, 'level', new_level, 'coins', current_coins)
  );
end;
$function$;

revoke all on function public.submit_challenge_answer(uuid, integer) from public;
grant execute on function public.submit_challenge_answer(uuid, integer) to authenticated;
