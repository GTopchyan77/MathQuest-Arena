drop policy if exists "Players insert their own profile" on public.profiles;

revoke insert on public.profiles from anon, authenticated;

create index if not exists scores_user_game_created_at_idx
on public.scores (user_id, game_slug, created_at desc);

create index if not exists profiles_role_id_idx
on public.profiles (role, id);

drop function if exists public.get_teacher_classes();
create or replace function public.get_teacher_classes()
returns table (
  id uuid,
  name text,
  student_count bigint,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'teacher'
  ) then
    raise exception 'Teacher access required';
  end if;

  return query
  select
    c.id,
    c.name,
    count(ce.id)::bigint as student_count,
    c.created_at,
    c.updated_at
  from public.classes c
  left join public.class_enrollments ce on ce.class_id = c.id
  where c.teacher_id = auth.uid()
  group by c.id, c.name, c.created_at, c.updated_at
  order by c.created_at asc;
end;
$$;

drop function if exists public.get_teacher_class_summary(uuid, text);
create or replace function public.get_teacher_class_summary(
  class_id uuid,
  teacher_timezone text default 'UTC'
)
returns table (
  id uuid,
  name text,
  roster_count bigint,
  participating_students bigint,
  active_today bigint,
  average_accuracy integer,
  average_practice_performance integer,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if not exists (
    select 1
    from pg_timezone_names tzn
    where tzn.name = teacher_timezone
  ) then
    raise exception 'Invalid timezone';
  end if;

  if not exists (
    select 1
    from public.classes c
    join public.profiles p on p.id = auth.uid()
    where c.id = class_id
      and c.teacher_id = auth.uid()
      and p.role = 'teacher'
  ) then
    raise exception 'Teacher does not own this class';
  end if;

  return query
  with teacher_class as (
    select c.id, c.name, c.created_at, c.updated_at
    from public.classes c
    where c.id = class_id
      and c.teacher_id = auth.uid()
  ),
  enrolled_students as (
    select
      ce.class_id,
      ce.student_id
    from public.class_enrollments ce
    join teacher_class tc on tc.id = ce.class_id
  ),
  scored_rows as (
    select
      es.student_id,
      s.accuracy,
      s.created_at,
      row_number() over (
        partition by es.student_id
        order by s.created_at desc, s.id desc
      ) as rn
    from enrolled_students es
    join public.scores s on s.user_id = es.student_id
  ),
  per_student as (
    select
      es.student_id,
      count(sr.accuracy)::bigint as games_played,
      case
        when count(sr.accuracy) > 0 then round(avg(sr.accuracy))::integer
        else 0
      end as average_accuracy,
      max(sr.created_at) as last_played_at,
      case
        when count(*) filter (where sr.rn <= 5) > 0
          then round(avg(sr.accuracy) filter (where sr.rn <= 5))::integer
        else null
      end as last5_accuracy
    from enrolled_students es
    left join scored_rows sr on sr.student_id = es.student_id
    group by es.student_id
  )
  select
    tc.id,
    tc.name,
    count(es.student_id)::bigint as roster_count,
    count(*) filter (where ps.games_played > 0)::bigint as participating_students,
    count(*) filter (
      where ps.last_played_at is not null
        and ((ps.last_played_at at time zone teacher_timezone)::date = (now() at time zone teacher_timezone)::date)
    )::bigint as active_today,
    case
      when count(*) filter (where ps.games_played > 0) > 0
        then round(avg(ps.average_accuracy) filter (where ps.games_played > 0))::integer
      else 0
    end as average_accuracy,
    case
      when count(*) filter (where ps.games_played > 0) > 0
        then round(avg(coalesce(ps.last5_accuracy, ps.average_accuracy)) filter (where ps.games_played > 0))::integer
      else 0
    end as average_practice_performance,
    tc.created_at,
    tc.updated_at
  from teacher_class tc
  left join enrolled_students es on es.class_id = tc.id
  left join per_student ps on ps.student_id = es.student_id
  group by tc.id, tc.name, tc.created_at, tc.updated_at;
end;
$$;

drop function if exists public.get_teacher_class_roster_analytics(uuid, text);
create or replace function public.get_teacher_class_roster_analytics(
  class_id uuid,
  teacher_timezone text default 'UTC'
)
returns table (
  student_id uuid,
  display_name text,
  total_xp integer,
  games_played bigint,
  best_score integer,
  average_accuracy integer,
  last_played_at timestamptz,
  latest_game_slug text,
  last3_accuracy integer,
  last5_accuracy integer,
  low_accuracy_count_recent bigint,
  recent_trend integer,
  recent_active_days bigint,
  recent_session_count bigint,
  has_historical_struggle boolean
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if not exists (
    select 1
    from pg_timezone_names tzn
    where tzn.name = teacher_timezone
  ) then
    raise exception 'Invalid timezone';
  end if;

  if not exists (
    select 1
    from public.classes c
    join public.profiles p on p.id = auth.uid()
    where c.id = class_id
      and c.teacher_id = auth.uid()
      and p.role = 'teacher'
  ) then
    raise exception 'Teacher does not own this class';
  end if;

  return query
  with teacher_class as (
    select c.id
    from public.classes c
    where c.id = class_id
      and c.teacher_id = auth.uid()
  ),
  enrolled_students as (
    select
      ce.class_id,
      ce.student_id,
      coalesce(nullif(pr.display_name, ''), 'Player') as display_name,
      pr.total_xp
    from public.class_enrollments ce
    join teacher_class tc on tc.id = ce.class_id
    join public.profiles pr on pr.id = ce.student_id
  ),
  scored_rows as (
    select
      es.student_id,
      s.id as score_id,
      s.score,
      s.accuracy,
      s.game_slug,
      s.created_at,
      row_number() over (
        partition by es.student_id
        order by s.created_at desc, s.id desc
      ) as rn
    from enrolled_students es
    join public.scores s on s.user_id = es.student_id
  ),
  score_aggregates as (
    select
      es.student_id,
      count(sr.score_id)::bigint as games_played,
      coalesce(max(sr.score), 0)::integer as best_score,
      case
        when count(sr.score_id) > 0 then round(avg(sr.accuracy))::integer
        else 0
      end as average_accuracy,
      max(sr.created_at) as last_played_at,
      (array_agg(sr.game_slug order by sr.created_at desc, sr.score_id desc))[1] as latest_game_slug,
      case
        when count(*) filter (where sr.rn <= 3) > 0
          then round(avg(sr.accuracy) filter (where sr.rn <= 3))::integer
        else null
      end as last3_accuracy,
      case
        when count(*) filter (where sr.rn <= 5) > 0
          then round(avg(sr.accuracy) filter (where sr.rn <= 5))::integer
        else null
      end as last5_accuracy,
      count(*) filter (where sr.rn <= 5 and sr.accuracy <= 65)::bigint as low_accuracy_count_recent,
      case
        when count(*) filter (where sr.rn <= 3) >= 2 then
          max(sr.accuracy) filter (where sr.rn = 1)
          -
          coalesce(
            max(sr.accuracy) filter (where sr.rn = 3),
            max(sr.accuracy) filter (where sr.rn = 2)
          )
        else null
      end::integer as recent_trend,
      count(distinct (sr.created_at at time zone teacher_timezone)::date) filter (
        where sr.created_at >= now() - interval '14 days'
      )::bigint as recent_active_days,
      count(*) filter (
        where sr.created_at >= now() - interval '14 days'
      )::bigint as recent_session_count
    from enrolled_students es
    left join scored_rows sr on sr.student_id = es.student_id
    group by es.student_id
  )
  select
    es.student_id,
    es.display_name,
    coalesce(es.total_xp, 0) as total_xp,
    coalesce(sa.games_played, 0) as games_played,
    coalesce(sa.best_score, 0) as best_score,
    coalesce(sa.average_accuracy, 0) as average_accuracy,
    sa.last_played_at,
    sa.latest_game_slug,
    sa.last3_accuracy,
    sa.last5_accuracy,
    coalesce(sa.low_accuracy_count_recent, 0) as low_accuracy_count_recent,
    sa.recent_trend,
    coalesce(sa.recent_active_days, 0) as recent_active_days,
    coalesce(sa.recent_session_count, 0) as recent_session_count,
    (
      (sa.last5_accuracy is not null and sa.last5_accuracy < 72)
      or coalesce(sa.low_accuracy_count_recent, 0) >= 2
    ) as has_historical_struggle
  from enrolled_students es
  left join score_aggregates sa on sa.student_id = es.student_id
  order by es.display_name asc;
end;
$$;

drop function if exists public.get_teacher_class_game_performance(uuid);
create or replace function public.get_teacher_class_game_performance(
  class_id uuid
)
returns table (
  game_slug text,
  participant_count bigint,
  performance integer
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if not exists (
    select 1
    from public.classes c
    join public.profiles p on p.id = auth.uid()
    where c.id = class_id
      and c.teacher_id = auth.uid()
      and p.role = 'teacher'
  ) then
    raise exception 'Teacher does not own this class';
  end if;

  return query
  with teacher_class as (
    select c.id
    from public.classes c
    where c.id = class_id
      and c.teacher_id = auth.uid()
  ),
  enrolled_students as (
    select
      ce.student_id
    from public.class_enrollments ce
    join teacher_class tc on tc.id = ce.class_id
  )
  select
    s.game_slug,
    count(distinct s.user_id)::bigint as participant_count,
    round(avg(s.accuracy))::integer as performance
  from enrolled_students es
  join public.scores s on s.user_id = es.student_id
  group by s.game_slug
  order by s.game_slug asc;
end;
$$;

revoke all on function public.get_teacher_classes() from public;
revoke all on function public.get_teacher_classes() from anon;
grant execute on function public.get_teacher_classes() to authenticated;

revoke all on function public.get_teacher_class_summary(uuid, text) from public;
revoke all on function public.get_teacher_class_summary(uuid, text) from anon;
grant execute on function public.get_teacher_class_summary(uuid, text) to authenticated;

revoke all on function public.get_teacher_class_roster_analytics(uuid, text) from public;
revoke all on function public.get_teacher_class_roster_analytics(uuid, text) from anon;
grant execute on function public.get_teacher_class_roster_analytics(uuid, text) to authenticated;

revoke all on function public.get_teacher_class_game_performance(uuid) from public;
revoke all on function public.get_teacher_class_game_performance(uuid) from anon;
grant execute on function public.get_teacher_class_game_performance(uuid) to authenticated;
