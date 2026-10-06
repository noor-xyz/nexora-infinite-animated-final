-- Repair profile creation for existing Supabase projects. Safe to re-run.
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

do $backfill$
declare
  existing_user record;
  requested_username text;
begin
  for existing_user in
    select u.id, u.raw_user_meta_data, u.email
    from auth.users as u
    where not exists (
      select 1
      from public.profiles as p
      where p.id = u.id
    )
  loop
    requested_username := pg_catalog.lower(pg_catalog.regexp_replace(
      coalesce(
        nullif(pg_catalog.btrim(existing_user.raw_user_meta_data ->> 'username'), ''),
        nullif(pg_catalog.split_part(coalesce(existing_user.email, ''), '@', 1), ''),
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
      values (existing_user.id, requested_username)
      on conflict (id) do nothing;
    exception when unique_violation then
      insert into public.profiles (id, username)
      values (
        existing_user.id,
        requested_username || '_' || pg_catalog.replace(existing_user.id::text, '-', '')
      )
      on conflict (id) do nothing;
    end;
  end loop;
end;
$backfill$;
