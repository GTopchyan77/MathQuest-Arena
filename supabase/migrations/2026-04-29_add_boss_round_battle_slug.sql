alter table public.game_sessions
drop constraint if exists game_sessions_game_slug_check;

alter table public.game_sessions
add constraint game_sessions_game_slug_check
check (
  game_slug in (
    'quick-math-duel',
    'missing-number-puzzle',
    'math-grid-puzzle',
    'boss-round-battle'
  )
);

alter table public.scores
drop constraint if exists scores_game_slug_check;

alter table public.scores
add constraint scores_game_slug_check
check (
  game_slug in (
    'quick-math-duel',
    'missing-number-puzzle',
    'math-grid-puzzle',
    'boss-round-battle'
  )
);
