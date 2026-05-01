# MathQuest Arena Project Handoff

Last updated: 2026-05-01

This document is the fast-start handoff for any new AI assistant, Codex session, or developer joining the MathQuest Arena project. It is written to replace long chat history with a practical view of the product, architecture, current status, risks, and next steps.

## 1. Project Overview

### What MathQuest Arena is

MathQuest Arena is a browser-based educational math game platform built as a polished MVP. It combines short arcade-style math mini-games with user accounts, saved progress, a leaderboard, lightweight progression systems, and a teacher-facing read-only classroom dashboard.

There are two main product surfaces:

- Learner side:
  registration/login, game play, score saving, dashboard, profile, leaderboard, progression
- Teacher side:
  read-only class analytics powered by live Supabase RPCs

### Tech stack

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS
- Lucide React icons
- Supabase Auth + Postgres + RPCs + RLS

### Current product stage

This project is in late MVP / pilot-prep stage.

Core learner flows exist.
Teacher preview exists with live Supabase-backed read-only analytics.
Core i18n infrastructure exists for English, Armenian, and Russian.

The product is not yet a full school system. It is still missing teacher actions, homework/assignment workflows, parent-facing features, notifications, and deeper classroom operations.

### Main goal

The immediate goal is to polish and stabilize the MVP for pilot/demo readiness without widening scope. Priority is learner/teacher flow reliability, navigation correctness, trust signals, and final localization QA.

## 2. Current Roadmap Status

### Completed phases

1. Learner MVP foundation
   - Landing page
   - Auth
   - Dashboard
   - Profile
   - Leaderboard
   - Initial game architecture

2. Game expansion
   - Quick Math Duel
   - Missing Number Puzzle
   - Math Grid Puzzle
   - Boss Round Battle

3. Progression + persistence
   - Saved scores
   - Game sessions
   - XP
   - Level system
   - Streaks
   - Badges
   - Post-game insights

4. Teacher portal MVP
   - Teacher role support
   - Classes
   - Class enrollments
   - Teacher dashboard UI
   - Teacher class detail UI

5. Live teacher backend
   - Live teacher RPCs
   - Read-only teacher analytics from Supabase

6. i18n core
   - Client-side locale provider
   - Dictionary-based translations
   - EN / HY / RU support

### Current phase

Pilot hardening and teacher/localization polish.

This means:

- protect flows
- finish teacher navigation correctness
- stabilize teacher trust signals
- complete localization QA
- avoid broad product expansion

### Next phase

Pilot demo readiness and operational QA.

Likely focus:

1. Final teacher navigation + localization verification
2. Full learner + teacher test pass
3. Demo checklist
4. Only after that: teacher action workflow planning

## 3. Major Completed Features

### Student MVP

- Landing page marketing/product intro
- Registration/login/logout
- Protected dashboard/profile
- Saved scores
- Leaderboard
- Recent activity and progression summaries

### Games

- Quick Math Duel
- Missing Number Puzzle
- Math Grid Puzzle
- Boss Round Battle

Game logic is modularized under `src/lib/games` and rendered through feature modules under `src/features/games/modules`.

### Progression system

- Persistent XP via Supabase scores
- Level calculation
- Daily streak logic
- Badge milestones
- Post-game results with:
  - personal best
  - XP gained
  - rank movement
  - previous-run improvement
  - recommended next challenge

### Supabase persistence

- `profiles`
- `scores`
- `game_sessions`
- leaderboard RPC
- XP trigger
- auth profile creation trigger

### Teacher dashboard

- Teacher-only routes
- Teacher dashboard overview
- Class selection
- Intervention panels
- Class detail page
- Roster summaries
- Class leaderboard
- Practice performance by game

### Live teacher RPC backend

- `get_teacher_classes`
- `get_teacher_class_summary`
- `get_teacher_class_roster_analytics`
- `get_teacher_class_game_performance`

These power the live read-only teacher views.

### i18n EN/HY/RU

- In-repo dictionary system
- Locale provider
- Runtime fallback to English
- Translation keys across learner and teacher surfaces

Note: localization infrastructure is in place, but final text/visual QA is still part of current polish work.

## 4. Current Branches and Tags

### Branches

- `master`
  - primary integration branch
- `feature/live-teacher-data`
  - live teacher data integration work
- `feature/teacher-localization`
  - teacher-facing localization work
- `feature/teacher-portal-mvp`
  - teacher portal MVP branch

### Tags

- `v0.2-teacher-preview`
  - teacher preview milestone
- `v0.3-live-teacher-data`
  - live teacher RPC/data milestone
- `v0.4-i18n-core`
  - core localization system milestone
- `v0.5-teacher-i18n`
  - teacher localization milestone

## 5. Important Files and Folders

### `src/app`

Next.js route entrypoints.

Important routes:

- `src/app/page.tsx`
  - learner home page
- `src/app/dashboard/page.tsx`
  - protected learner dashboard
- `src/app/games/page.tsx`
  - game library
- `src/app/games/[slug]/page.tsx`
  - individual game route
- `src/app/profile/page.tsx`
  - protected learner profile
- `src/app/leaderboard/page.tsx`
  - leaderboard page
- `src/app/login/page.tsx`
  - login page
- `src/app/register/page.tsx`
  - register page
- `src/app/teacher/page.tsx`
  - teacher dashboard route
- `src/app/teacher/class/[id]/page.tsx`
  - teacher class detail route

### `src/features`

Feature-oriented UI organization.

Key areas:

- `auth`
  - auth views, hooks, access gates
- `dashboard`
  - learner dashboard components
- `games`
  - shared game components and game-specific modules
- `home`
  - home page support components
- `leaderboard`
  - leaderboard components
- `profile`
  - learner profile components
- `teacher`
  - teacher dashboard + class detail components

### `src/lib/supabase`

Supabase integration layer.

- `client.ts`
  - browser client and env/config detection
- `auth.ts`
  - register/login/logout helpers
- `profileRepository.ts`
  - profile reads
- `scores.ts`
  - learner score saving and learner-side stats fetches
- `teacher.ts`
  - teacher live RPC integration and teacher-side signal mapping

### `src/lib/i18n`

Client-side localization system.

- `config.ts`
  - locale list/config
- `I18nProvider.tsx`
  - locale state + persistence
- `getMessage.ts`
  - dictionary lookup / fallback
- `useLocale.ts`
  - consumer hook
- `messages/en.ts`
  - English dictionary
- `messages/hy.ts`
  - Armenian dictionary
- `messages/ru.ts`
  - Russian dictionary
- `messages/index.ts`
  - typed message bundle export

### `src/shared`

Shared layout and UI primitives used across pages/features.

Important examples:

- layout shell
- site header
- shared buttons/cards

### `supabase/migrations`

Incremental database evolution beyond the base schema.

- `2026-04-29_add_boss_round_battle_slug.sql`
  - adds boss-round support to allowed game slugs
- `2026-04-29_teacher_portal_phase1.sql`
  - teacher role, classes, enrollments, RLS
- `2026-04-29_teacher_live_rpc.sql`
  - live read-only teacher RPCs and related indexes

## 6. Supabase Schema and RPCs

### `profiles`

Purpose:

- one row per auth user
- public profile data
- total XP
- teacher/student role

Important fields:

- `id`
- `display_name`
- `avatar_url`
- `total_xp`
- `role`
- timestamps

Important rules:

- profile row auto-created by trigger on auth user creation
- authenticated users can only update limited profile columns
- teacher role is important for route/navigation and RPC authorization

### `scores`

Purpose:

- saved performance results
- leaderboard source
- XP trigger source

Important fields:

- `user_id`
- `game_session_id`
- `game_slug`
- `score`
- `accuracy`
- `max_streak`
- `created_at`

### `game_sessions`

Purpose:

- completed play session record
- more detailed play/session storage than leaderboard rows alone

Important fields:

- `user_id`
- `game_slug`
- `score`
- `correct_answers`
- `total_questions`
- `duration_seconds`
- `started_at`
- `ended_at`

### `classes`

Purpose:

- teacher-owned classrooms

Important fields:

- `teacher_id`
- `name`
- timestamps

### `class_enrollments`

Purpose:

- roster membership linking students to teacher classes

Important fields:

- `class_id`
- `student_id`
- unique `(class_id, student_id)`

### Teacher RPCs

#### `get_teacher_classes`

Returns teacher-owned classes with student counts.

Used by:

- teacher dashboard class list and class picker

#### `get_teacher_class_summary`

Returns class-level summary metrics:

- roster count
- participating students
- active today
- average accuracy
- average practice performance

Used by:

- teacher dashboard overview

#### `get_teacher_class_roster_analytics`

Returns per-student analytics, including:

- display name
- total XP
- games played
- best score
- average accuracy
- last played at
- recent trend
- recent active days
- recent session count
- historical struggle flags

Used by:

- roster rendering
- intervention buckets
- readiness/attention/inactive signals

#### `get_teacher_class_game_performance`

Returns game-level class performance:

- game slug
- participant count
- performance average

Used by:

- teacher dashboard and class-level performance panels

## 7. Current Architecture Rules

These are important working rules for future contributors and AI sessions.

### 1. Do not change backend unless required

The Supabase layer has already gone through trust and safety review. Do not widen SQL/RPC/schema scope unless there is a real blocker or clearly approved need.

### 2. Teacher dashboard is read-only

Current teacher views are observational only.

They do not:

- assign work
- message students
- mutate student records
- change grades

### 3. Teacher actions are not implemented yet

Intervention panels currently surface suggested teacher moves and evidence, but they are informational only.

### 4. i18n uses the in-repo dictionary system

Translations are stored in local TS dictionaries, not a remote translation service.

### 5. Game titles may remain English

Game titles/slugs/catalog names can remain English where needed for consistency and product branding.

### 6. Keep role-based teacher navigation

Teacher links should appear only for teacher users.
Teacher routes must remain protected.

## 8. Known Limitations and Risks

- Teacher actions are not implemented
- No homework/assignment workflow
- No parent portal
- No notifications/reminders
- No grading/report card system
- i18n is client-side only
- Teacher dashboard is still read-only
- Some teacher metrics are MVP heuristics, not high-stakes academic judgments
- Progression is motivational, not standards-aligned assessment
- Final localization visual QA is still important before pilot/demo

## 9. What NOT to Do Next

These are intentionally postponed.

Do not start these before pilot polish unless explicitly redirected:

- in-product chat
- homework system
- parent portal
- notification system
- formal grading/reporting system
- large architecture refactors
- new mini-games before pilot polish
- broad backend redesign
- teacher write-actions without product agreement

## 10. Recommended Next Steps

Prioritized order:

1. Commit latest teacher navigation fix
   - make sure the most recent teacher nav gating work is safely committed

2. Test teacher nav as teacher and student
   - teacher link visibility
   - protected teacher routes
   - no raw errors

3. Final i18n visual QA
   - especially teacher surfaces
   - especially Armenian and Russian
   - check text rendering, overflow, and mixed-language leaks

4. Prepare pilot demo checklist
   - learner happy path
   - teacher happy path
   - class selection
   - save score flow
   - leaderboard

5. Later: teacher action workflow
   - only after current MVP polish is stable
   - still should remain small and targeted

## 11. Setup Commands

### Install dependencies

```bash
npm install
```

### Run development server

```bash
npm run dev
```

### Type-check

```bash
npm run typecheck
```

### Supabase environment requirements

Create `.env.local` with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Then run:

- `supabase/schema.sql`
- plus teacher migrations in `supabase/migrations` as needed for live teacher functionality

Important migrations for teacher mode:

- `2026-04-29_teacher_portal_phase1.sql`
- `2026-04-29_teacher_live_rpc.sql`

## 12. Testing Checklist

### Learner flow

- home page loads
- register works
- login works
- logout works
- protected routes redirect properly
- dashboard loads after login
- each game route loads
- results panel appears
- save score works
- profile updates from real saved data
- leaderboard updates from saved runs

### Teacher flow

- student user does not see teacher nav
- teacher user does see teacher nav
- `/teacher` route is protected
- `/teacher/class/[id]` route is protected
- teacher class list loads
- class selection works
- class detail opens from dashboard
- no raw backend errors reach UI
- no-data students show safe empty/not-started states

### i18n flow

- locale switch persists
- English renders cleanly
- Armenian renders cleanly
- Russian renders cleanly
- teacher pages do not leak unexpected English
- compact cards/buttons do not overflow

### Supabase RPC smoke tests

- `get_teacher_classes`
- `get_teacher_class_summary`
- `get_teacher_class_roster_analytics`
- `get_teacher_class_game_performance`

Check:

- teacher access works
- student access is denied
- invalid class id is handled safely
- class ownership boundaries are respected

## 13. Agent Usage Guide

Use this as a rough division of responsibility when assigning work to specialized assistants or future sessions.

### Review MathQuest Arena MVP

Best for:

- QA reviews
- UX audits
- retention and onboarding audits
- demo-readiness review
- bug/risk prioritization

### Build MathQuest Arena frontend

Best for:

- page/component implementation
- learner flows
- navigation polish
- route protection
- UI bug fixes
- responsive cleanup

### Set up Supabase backend

Best for:

- schema updates
- RLS review
- RPC implementation
- migrations
- auth/data integrity work

Use carefully. Backend changes should remain minimal unless truly necessary.

### Teacher Dashboard Agent

Best for:

- teacher dashboard UI
- teacher class detail UI
- teacher flow review
- trust-signal QA
- teacher localization pass

### Design MathQuest Arena UI

Best for:

- visual QA
- spacing/overflow review
- consistency pass
- polish before demo

### Add modular math mini-games

Best for:

- new game logic in `src/lib/games`
- new game modules in `src/features/games/modules`
- game loop correctness

Do not prioritize this agent right now unless pilot polish is already complete.

## Final Guidance for the Next Contributor

If you are picking up this project fresh, start here:

1. Read this file fully.
2. Inspect `src/lib/supabase/teacher.ts`, `src/features/teacher/components`, and `src/lib/i18n/messages`.
3. Run `npm run typecheck`.
4. Test learner and teacher happy paths locally.
5. Prefer small isolated fixes over refactors.

The project is already broad enough for MVP. The right move now is careful polish, not expansion.
