-- MathQuest Arena MVP Supabase schema
-- Run this once in the Supabase SQL editor for your project.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  total_xp integer not null default 0 check (total_xp >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  game_slug text not null check (game_slug in ('quick-math-duel', 'missing-number-puzzle', 'math-grid-puzzle', 'boss-round-battle')),
  score integer not null default 0 check (score >= 0),
  correct_answers integer not null default 0 check (correct_answers >= 0),
  total_questions integer not null default 0 check (total_questions >= 0),
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  started_at timestamptz not null default now(),
  ended_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  game_session_id uuid references public.game_sessions(id) on delete set null,
  game_slug text not null check (game_slug in ('quick-math-duel', 'missing-number-puzzle', 'math-grid-puzzle', 'boss-round-battle')),
  score integer not null check (score >= 0),
  accuracy integer not null default 0 check (accuracy between 0 and 100),
  max_streak integer not null default 0 check (max_streak >= 0),
  created_at timestamptz not null default now()
);

create index if not exists game_sessions_user_created_idx on public.game_sessions(user_id, created_at desc);
create index if not exists scores_user_created_idx on public.scores(user_id, created_at desc);
create index if not exists scores_game_score_idx on public.scores(game_slug, score desc, created_at asc);
create index if not exists scores_score_idx on public.scores(score desc, created_at asc);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'display_name', ''), split_part(new.email, '@', 1), 'Player')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.create_profile_for_new_user();

create or replace function public.add_score_to_profile_xp()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set total_xp = total_xp + new.score
  where id = new.user_id;

  return new;
end;
$$;

drop trigger if exists scores_add_profile_xp on public.scores;
create trigger scores_add_profile_xp
after insert on public.scores
for each row execute function public.add_score_to_profile_xp();

create or replace function public.get_leaderboard(selected_game text default null)
returns table (
  rank bigint,
  user_id uuid,
  display_name text,
  total_score bigint,
  best_score integer,
  games_played bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    dense_rank() over (order by sum(s.score) desc, max(s.score) desc, min(s.created_at) asc) as rank,
    s.user_id,
    coalesce(nullif(p.display_name, ''), 'Player') as display_name,
    sum(s.score)::bigint as total_score,
    max(s.score)::integer as best_score,
    count(*)::bigint as games_played
  from public.scores s
  left join public.profiles p on p.id = s.user_id
  where selected_game is null or s.game_slug = selected_game
  group by s.user_id, p.display_name
  order by total_score desc, best_score desc, min(s.created_at) asc
  limit 50;
$$;

alter table public.profiles enable row level security;
alter table public.game_sessions enable row level security;
alter table public.scores enable row level security;

drop policy if exists "Profiles are visible to everyone" on public.profiles;
create policy "Profiles are visible to everyone"
on public.profiles for select
using (true);

drop policy if exists "Players update their own profile" on public.profiles;
create policy "Players update their own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Players insert their own profile" on public.profiles;
create policy "Players insert their own profile"
on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists "Players read their own sessions" on public.game_sessions;
create policy "Players read their own sessions"
on public.game_sessions for select
using (auth.uid() = user_id);

drop policy if exists "Players insert their own sessions" on public.game_sessions;
create policy "Players insert their own sessions"
on public.game_sessions for insert
with check (auth.uid() = user_id);

drop policy if exists "Players update their own sessions" on public.game_sessions;
create policy "Players update their own sessions"
on public.game_sessions for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Players read their own scores" on public.scores;
create policy "Players read their own scores"
on public.scores for select
using (auth.uid() = user_id);

drop policy if exists "Players insert their own scores" on public.scores;
create policy "Players insert their own scores"
on public.scores for insert
with check (
  auth.uid() = user_id
  and (
    game_session_id is null
    or exists (
      select 1
      from public.game_sessions gs
      where gs.id = game_session_id
        and gs.user_id = auth.uid()
    )
  )
);

grant execute on function public.get_leaderboard(text) to anon, authenticated;

revoke update on public.profiles from anon, authenticated;
grant update (display_name, avatar_url) on public.profiles to authenticated;
