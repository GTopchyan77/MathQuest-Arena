# MathQuest Arena

MathQuest Arena is a polished browser-based educational math gaming platform built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

- Landing page, auth pages, dashboard, games, profile, and leaderboard
- Supabase auth with email/password registration and login
- Score and session persistence through Supabase
- Three modular math mini-games:
  - Quick Math Duel
  - Missing Number Puzzle
  - Math Grid Puzzle
- Responsive, production-minded UI
- Reusable components and game logic separated from React views

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

3. Run the database schema in Supabase SQL editor:

```bash
supabase/schema.sql
```

4. Start the dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Supabase Notes

The app includes safe fallbacks when Supabase environment variables are missing so the UI can still be reviewed locally. Auth and score saving require valid Supabase credentials and the schema in `supabase/schema.sql`.

### Schema Design

- `profiles`: one row per Supabase auth user. Stores public display name, optional avatar URL, and MVP `total_xp`.
- `game_sessions`: one row per completed play session. Stores game slug, score, question counts, optional duration, and owner.
- `scores`: one leaderboard score per saved result. Links back to `game_sessions` and stores score, accuracy, and max streak.
- `get_leaderboard(selected_game)`: public RPC returning aggregated rank, display name, total score, best score, and games played.

### Auth Integration

1. Create a Supabase project and enable Email auth.
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`.
3. Run [supabase/schema.sql](supabase/schema.sql) in the Supabase SQL editor.
4. Registration and login use [src/lib/supabase/auth.ts](src/lib/supabase/auth.ts).
5. New auth users automatically get a `profiles` row from the `on_auth_user_created` trigger.

### Data Access Helpers

- [src/lib/supabase/client.ts](src/lib/supabase/client.ts): browser Supabase client and config guard.
- [src/lib/supabase/auth.ts](src/lib/supabase/auth.ts): register, login, logout.
- [src/lib/supabase/profiles.ts](src/lib/supabase/profiles.ts): current profile read/update.
- [src/lib/supabase/scores.ts](src/lib/supabase/scores.ts): save result, fetch current user's recent scores, fetch leaderboard.

### Score Save Flow

1. Game produces a `GameResult`.
2. `saveGameResult` checks the logged-in Supabase user.
3. It inserts a `game_sessions` row owned by that user.
4. It inserts a `scores` row linked to the session.
5. The `scores_add_profile_xp` trigger adds the score to `profiles.total_xp`.

### Leaderboard Fetch Flow

1. The leaderboard page calls `getLeaderboard(gameSlug?)`.
2. The helper calls Supabase RPC `get_leaderboard`.
3. The SQL function aggregates `scores`, joins display names from `profiles`, ranks players, and returns the top 50.

### Row-Level Security

- Profiles are publicly readable so leaderboards can show display names.
- Players can insert/update only their own profile.
- Players can read/insert/update only their own game sessions.
- Players can read/insert only their own scores.
- Public leaderboard access is exposed only through the aggregate RPC, not raw score rows.

## Project Structure

```text
src/app              Route pages and app shell
src/components       Reusable UI and game components
src/lib              Supabase helpers, types, game logic, data utilities
supabase             Database schema
```
