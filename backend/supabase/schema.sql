-- NEXORA production schema
-- Safe to re-run: policies/triggers/functions are recreated, seed data is upserted.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  avatar_url text,
  total_xp integer not null default 0,
  level integer not null default 1,
  coins integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.worlds (
  id text primary key, name text not null, icon text, description text,
  color text, sort_order integer not null default 0, is_active boolean not null default true
);

create table if not exists public.chapters (
  id uuid primary key default gen_random_uuid(),
  world_id text not null references public.worlds(id) on delete cascade,
  chapter_number integer not null, title text not null, description text,
  unique(world_id, chapter_number)
);

create table if not exists public.levels (
  id uuid primary key default gen_random_uuid(),
  world_id text not null references public.worlds(id) on delete cascade,
  level_number integer not null,
  chapter_id uuid references public.chapters(id) on delete set null,
  title text not null,
  topic text,
  difficulty text not null default 'beginner' check (difficulty in ('beginner','intermediate','advanced','master')),
  xp_reward integer not null default 50,
  challenge_count integer not null default 5,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(world_id, level_number)
);

create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  level_id uuid not null references public.levels(id) on delete cascade,
  challenge_number integer not null,
  type text not null default 'quiz',
  prompt text not null,
  options jsonb,
  answer jsonb,
  explanation text,
  xp_reward integer not null default 10,
  unique(level_id, challenge_number)
);

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

create table if not exists public.boss_battles (
  id uuid primary key default gen_random_uuid(),
  world_id text not null references public.worlds(id) on delete cascade,
  level_number integer not null,
  title text not null,
  description text,
  challenge_count integer not null default 7,
  xp_reward integer not null default 250,
  unique(world_id, level_number)
);

create table if not exists public.user_skill_mastery (
  user_id uuid references public.profiles(id) on delete cascade,
  world_id text references public.worlds(id) on delete cascade,
  topic text not null, mastery_score numeric(5,2) default 0,
  correct_count integer default 0, wrong_count integer default 0,
  attempts integer default 0, average_time_ms integer default 0,
  updated_at timestamptz default now(),
  primary key(user_id, world_id, topic)
);

create table if not exists public.user_progress (
  user_id uuid references public.profiles(id) on delete cascade,
  world_id text references public.worlds(id) on delete cascade,
  level_number integer not null, status text default 'locked',
  completed_at timestamptz,
  primary key(user_id, world_id, level_number)
);

create table if not exists public.streaks (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  current_streak integer default 0, longest_streak integer default 0,
  last_activity_date date
);

create table if not exists public.achievements (
  id text primary key, title text not null, description text, icon text
);

create table if not exists public.user_achievements (
  user_id uuid references public.profiles(id) on delete cascade,
  achievement_id text references public.achievements(id) on delete cascade,
  unlocked_at timestamptz default now(),
  primary key(user_id, achievement_id)
);

alter table public.profiles enable row level security;
alter table public.worlds enable row level security;
alter table public.chapters enable row level security;
alter table public.levels enable row level security;
alter table public.challenges enable row level security;
alter table public.user_challenge_attempts enable row level security;
alter table public.boss_battles enable row level security;
alter table public.user_skill_mastery enable row level security;
alter table public.user_progress enable row level security;
alter table public.streaks enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;

revoke update on table public.profiles from public, anon, authenticated;
revoke update (total_xp, level, coins) on table public.profiles from public, anon, authenticated;
grant update (id, username, avatar_url) on table public.profiles to authenticated;
revoke select on table public.challenges from public, anon, authenticated;
grant select (id, level_id, challenge_number, type, prompt, options, xp_reward)
  on table public.challenges to authenticated;
revoke all on table public.user_challenge_attempts from public, anon, authenticated;
grant select on table public.user_challenge_attempts to authenticated;

do $$ begin
  drop policy if exists "profiles self read" on public.profiles;
  drop policy if exists "profiles self update" on public.profiles;
  drop policy if exists "profiles self insert" on public.profiles;
  drop policy if exists "mastery self" on public.user_skill_mastery;
  drop policy if exists "progress self" on public.user_progress;
  drop policy if exists "streak self" on public.streaks;
  drop policy if exists "achievement self" on public.user_achievements;
  drop policy if exists "worlds public read" on public.worlds;
  drop policy if exists "chapters public read" on public.chapters;
  drop policy if exists "levels public read" on public.levels;
  drop policy if exists "challenges public read" on public.challenges;
  drop policy if exists "challenge attempts self read" on public.user_challenge_attempts;
  drop policy if exists "bosses public read" on public.boss_battles;
  drop policy if exists "achievements public read" on public.achievements;
end $$;

create policy "profiles self read" on public.profiles for select using (auth.uid() = id);
create policy "profiles self update" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles self insert" on public.profiles for insert with check (auth.uid() = id);
create policy "mastery self" on public.user_skill_mastery for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "progress self" on public.user_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "streak self" on public.streaks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "achievement self" on public.user_achievements for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "worlds public read" on public.worlds for select using (is_active = true);
create policy "chapters public read" on public.chapters for select using (true);
create policy "levels public read" on public.levels for select using (is_active = true);
create policy "challenges public read" on public.challenges for select using (true);
create policy "challenge attempts self read" on public.user_challenge_attempts for select using (auth.uid() = user_id);
create policy "bosses public read" on public.boss_battles for select using (true);
create policy "achievements public read" on public.achievements for select using (true);

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
  select p.total_xp, p.coins into current_xp, current_coins
  from public.profiles as p where p.id = acting_user_id for update;
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

  select a.* into previous_attempt
  from public.user_challenge_attempts as a
  where a.user_id = acting_user_id and a.challenge_id = p_challenge_id;
  if found then
    select pg_catalog.count(*)::integer into total_challenges
    from public.challenges as c where c.level_id = challenge_row.level_id;
    select pg_catalog.count(*)::integer into answered_challenges
    from public.user_challenge_attempts as a
    join public.challenges as c on c.id = a.challenge_id
    where a.user_id = acting_user_id and c.level_id = challenge_row.level_id;
    select p.status = 'completed', p.completed_at into is_complete, completed_at_value
    from public.user_progress as p
    where p.user_id = acting_user_id
      and p.world_id = challenge_row.world_id
      and p.level_number = challenge_row.level_number;
    select p.total_xp, p.level, p.coins into new_xp, new_level, current_coins
    from public.profiles as p where p.id = acting_user_id;

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

  select pg_catalog.count(*)::integer into total_challenges
  from public.challenges as c where c.level_id = challenge_row.level_id;
  select pg_catalog.count(*)::integer into answered_challenges
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
  set status = case when public.user_progress.status = 'completed'
                    then 'completed' else excluded.status end,
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

insert into public.worlds(id,name,icon,description,color,sort_order) values
('python','Python','🐍','Build your programming foundation.','violet',1),
('javascript','JavaScript','🟨','Create interactive web experiences.','cyan',2),
('java','Java','☕','Master powerful object-oriented programming.','orange',3),
('c','C','⚙️','Understand programming from the ground up.','blue',4),
('cpp','C++','💠','Level up with advanced programming.','indigo',5),
('web','HTML & CSS','🌐','Build modern websites and interfaces.','pink',6),
('sql','SQL','🗄️','Master databases and data queries.','green',7)
on conflict(id) do update set name=excluded.name, icon=excluded.icon, description=excluded.description, color=excluded.color, sort_order=excluded.sort_order;

insert into public.achievements(id,title,description,icon) values
('first_quest','First Quest','Complete your first quest.','🚀'),
('seven_day_streak','7 Day Streak','Learn for seven days in a row.','🔥'),
('debug_master','Debug Master','Solve 25 debugging challenges.','🐛'),
('boss_slayer','Boss Slayer','Defeat your first boss.','⚔️'),
('speed_runner','Speed Runner','Finish a challenge under the target time.','⚡'),
('thirty_day_streak','30 Day Streak','Maintain a thirty day streak.','🏆')
on conflict(id) do update set title=excluded.title,description=excluded.description,icon=excluded.icon;

-- Seed the first 20 levels for every world. The schema itself is not limited to 20:
-- later levels can be inserted/generated indefinitely.
with world_topics as (
  select * from (values
    ('python',array['Getting Started','Variables','Data Types','Operators','Input & Output','Conditions','Loops','Functions','Collections','Debugging','OOP','Modules']),
    ('javascript',array['Getting Started','Variables','Functions','Arrays','Objects','DOM','Events','Async','APIs','Modules','Testing','Architecture']),
    ('java',array['Getting Started','Types','Conditions','Loops','Methods','Arrays','OOP','Collections','Exceptions','Generics','Streams']),
    ('c',array['Getting Started','Variables','Operators','Conditions','Loops','Functions','Arrays','Pointers','Structs','Memory','Files']),
    ('cpp',array['Getting Started','Types','Control Flow','Functions','Arrays','Pointers','References','Classes','STL','Templates','Modern C++']),
    ('web',array['HTML Foundations','Semantic HTML','Forms','CSS Foundations','Selectors','Flexbox','Grid','Responsive Design','Animations','Accessibility','Projects']),
    ('sql',array['Databases','SELECT','Filtering','Sorting','Functions','JOINs','Grouping','Subqueries','CTEs','Window Functions','Indexes','Transactions'])
  ) as x(world_id,topics)
)
insert into public.levels(world_id,level_number,title,topic,difficulty,xp_reward,challenge_count)
select wt.world_id,n,
  'Level '||n||' · '||wt.topics[1+((n-1)%array_length(wt.topics,1))],
  wt.topics[1+((n-1)%array_length(wt.topics,1))],
  case when n<=20 then 'beginner' else 'intermediate' end,
  50+floor((n-1)/10)*15, 5
from world_topics wt cross join generate_series(1,20) n
on conflict(world_id,level_number) do nothing;

create or replace function public.get_leaderboard(limit_count integer default 50)
returns table(rank bigint, username text, total_xp integer, level integer)
language sql security invoker set search_path=public as $$
  select row_number() over(order by p.total_xp desc, p.level desc, p.username asc),
         p.username,p.total_xp,p.level
  from public.profiles p
  order by p.total_xp desc, p.level desc, p.username asc
  limit greatest(1, least(limit_count,100));
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  requested_username text;
begin
  requested_username := pg_catalog.lower(pg_catalog.regexp_replace(
    coalesce(
      nullif(pg_catalog.btrim(new.raw_user_meta_data ->> 'username'), ''),
      nullif(pg_catalog.split_part(coalesce(new.email, ''), '@', 1), ''),
      'player'
    ),
    '[^a-z0-9_-]+',
    '_',
    'g'
  ));
  requested_username := pg_catalog.btrim(pg_catalog.left(requested_username, 32), '_');
  if pg_catalog.length(requested_username) < 3 then
    requested_username := 'player';
  end if;

  begin
    insert into public.profiles (id, username)
    values (new.id, requested_username)
    on conflict (id) do nothing;
  exception when unique_violation then
    insert into public.profiles (id, username)
    values (new.id, requested_username || '_' || pg_catalog.replace(new.id::text, '-', ''))
    on conflict (id) do nothing;
  end;
  return new;
end;
$function$;

alter function public.handle_new_user() owner to postgres;
revoke all on function public.handle_new_user() from public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into public.profiles(id,username)
select u.id,left(trim(both '_' from lower(regexp_replace(coalesce(nullif(btrim(u.raw_user_meta_data->>'username'),''),split_part(coalesce(u.email,''),'@',1),'player'),'[^a-z0-9_-]+','_','g'))),32)||'_'||replace(u.id::text,'-','')
from auth.users u where not exists(select 1 from public.profiles p where p.id=u.id)
on conflict(id) do nothing;
