# MathQuest Arena Demo Runbook

Last updated: 2026-05-01

This runbook is for a non-technical demo operator. It explains how to start the app, prepare demo data, and present both the learner and teacher flows without needing chat history.

Use this document together with [PROJECT_HANDOFF.md](E:/MathQuest%20Arena/docs/PROJECT_HANDOFF.md) only if you need deeper project context. For the demo itself, this file should be enough.

## 1. What This Demo Covers

MathQuest Arena is a browser-based educational math game platform with two sides:

- Learner side:
  sign up, play short math games, save scores, view dashboard/profile/leaderboard
- Teacher side:
  view read-only classroom analytics using live Supabase data

This demo is best when shown as:

1. learner signs in and plays a game
2. learner saves a score
3. dashboard and leaderboard update
4. teacher opens class analytics and shows classroom insights

## 2. Before You Start

You need:

- the project files on your machine
- Node.js installed
- a Supabase project
- valid Supabase environment variables
- at least:
  - 1 teacher account
  - 2 or more learner accounts
  - 1 class
  - learners enrolled in that class
  - at least 1 saved score per learner if you want teacher analytics to look alive

If possible, prepare all accounts and data before the demo day.

## 3. How to Start the App

Open a terminal in the project root and run:

```bash
npm install
```

Then start the app:

```bash
npm run dev
```

Open the browser at:

```text
http://localhost:3000
```

Optional health check:

```bash
npm run typecheck
```

If typecheck passes and the app opens in the browser, you are ready to continue.

## 4. Required Environment and Supabase Assumptions

Create a file named `.env.local` in the project root with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

The app needs a Supabase project with:

- `supabase/schema.sql` applied
- `supabase/migrations/2026-04-29_teacher_portal_phase1.sql` applied
- `supabase/migrations/2026-04-29_teacher_live_rpc.sql` applied

Important demo assumption:

- For the smoothest learner demo, disable mandatory email confirmation in Supabase Auth, or use pre-created accounts.

Why this matters:

- If email confirmation is required, a new learner may stop at the "check your email" step instead of entering the game immediately.

## 5. Recommended Demo Accounts

Prepare these accounts before the demo:

- 1 teacher account
- 2 learner accounts

Suggested example accounts:

- Teacher:
  - `teacher.demo@example.com`
  - password: choose a simple demo-safe password
- Learner 1:
  - `student.one@example.com`
  - password: choose a simple demo-safe password
- Learner 2:
  - `student.two@example.com`
  - password: choose a simple demo-safe password

Use fake/demo emails only.

## 6. How to Make a Teacher Account

There is no in-app admin UI for promoting a user to teacher. You must do this in Supabase.

### Step 1: Create the account

Create the teacher account either:

- through the app register page, or
- directly in Supabase Auth

If you create it through the app, log in once so the profile row exists.

### Step 2: Set the profile role to teacher

Open the Supabase SQL Editor and run:

```sql
update public.profiles
set role = 'teacher'
where id = (
  select id
  from auth.users
  where email = 'teacher.demo@example.com'
);
```

### Step 3: Verify the role

Run:

```sql
select p.id, p.display_name, p.role
from public.profiles p
join auth.users u on u.id = p.id
where u.email = 'teacher.demo@example.com';
```

You should see `role = teacher`.

## 7. How to Create a Class

There is currently no teacher UI for creating classes. Use Supabase SQL Editor.

### Step 1: Find the teacher profile ID

```sql
select p.id, p.display_name
from public.profiles p
join auth.users u on u.id = p.id
where u.email = 'teacher.demo@example.com';
```

Copy the teacher `id`.

### Step 2: Create the class

```sql
insert into public.classes (teacher_id, name)
values ('PASTE-TEACHER-ID-HERE', 'Grade 4 Demo Class')
returning id, name, teacher_id;
```

Copy the returned class `id`.

## 8. How to Enroll Students

There is no in-app enrollment flow yet. Use Supabase SQL Editor.

### Step 1: Find learner profile IDs

```sql
select p.id, p.display_name, u.email
from public.profiles p
join auth.users u on u.id = p.id
where u.email in ('student.one@example.com', 'student.two@example.com');
```

### Step 2: Insert enrollments

Replace the IDs below:

```sql
insert into public.class_enrollments (class_id, student_id)
values
  ('PASTE-CLASS-ID-HERE', 'PASTE-STUDENT-ONE-ID-HERE'),
  ('PASTE-CLASS-ID-HERE', 'PASTE-STUDENT-TWO-ID-HERE');
```

### Step 3: Verify the roster

```sql
select
  c.name as class_name,
  p.display_name as student_name,
  u.email
from public.class_enrollments ce
join public.classes c on c.id = ce.class_id
join public.profiles p on p.id = ce.student_id
join auth.users u on u.id = p.id
where c.id = 'PASTE-CLASS-ID-HERE'
order by p.display_name asc;
```

## 9. Minimum Data Needed for a Good Teacher Demo

The teacher dashboard looks best if:

- each learner has logged in
- each learner has played at least one game
- each learner has saved at least one score

Best practice:

- have Learner 1 save 2-3 runs
- have Learner 2 save 1-2 runs
- use slightly different scores so the teacher leaderboard and performance panels look believable

## 10. Learner Demo Script

This is the safest learner demo flow.

### Option A: Use a pre-created learner account

This is the safest live-demo path.

1. Open `http://localhost:3000`
2. Click `Login`
3. Sign in as `student.one@example.com`
4. After login, you should land on the learner dashboard
5. Click `Games`
6. Open `Quick Math Duel`
7. Play a short round
8. On the results screen, click `Save score`
9. Open:
   - `Dashboard`
   - `Leaderboard`
   - `Profile`
10. Show that the saved run affects progress and recent activity

### Option B: Create a brand-new learner during the demo

Only use this if email confirmation is disabled in Supabase.

1. Open `Register`
2. Enter display name, email, and password
3. Submit the form
4. The app should route directly into `Quick Math Duel`
5. Play and save a score
6. Continue to dashboard and leaderboard

### Best learner talking points

- fast, low-friction play
- immediate score saving
- visible progress on dashboard
- leaderboard motivation
- profile/progression feel

## 11. Teacher Demo Script

Use the teacher account only after learner data already exists.

### Safe teacher path

1. Log out from the learner account
2. Log in as `teacher.demo@example.com`
3. After login, you may first land on the learner dashboard
4. Use the top navigation and click `Teacher Dashboard`
5. Confirm the class list appears
6. Select `Grade 4 Demo Class` if multiple classes exist
7. Show:
   - student count
   - played today
   - average accuracy
   - participation
8. Scroll through the intervention panels
9. Open the class detail page
10. Show:
   - roster
   - performance by game
   - class leaderboard snapshot

### Best teacher talking points

- teacher side is read-only in this MVP
- teachers can quickly see who has started
- teachers can see participation and class-level performance
- the product is aimed at quick pilot visibility, not full classroom workflow yet

## 12. EN / HY / RU Language Switch Demo

The language switcher is in the header.

### Safe language demo recommendation

- Use English as the primary demo language.
- Only show Armenian and Russian if you already verified the current build visually in the browser.

### How to demo language switching

1. Open the home page or learner dashboard
2. Click the language buttons in the header
3. Switch between:
   - `EN`
   - `HY`
   - `RU`
4. Confirm text updates across the current page

### Important caution

Do not improvise a teacher-language demo unless you have already checked:

- teacher dashboard
- teacher class detail page
- header labels
- compact cards for overflow

## 13. Known Safe Demo Path

If you want the lowest-risk presentation, use this exact order:

1. Start app locally
2. Log in with pre-created learner account
3. Go to `Quick Math Duel`
4. Play one short round
5. Save score
6. Open dashboard
7. Open leaderboard
8. Log out
9. Log in with pre-created teacher account
10. Open `Teacher Dashboard`
11. Open class detail page
12. Optionally switch to another language only if already QA-checked

This path avoids:

- email confirmation surprises
- empty teacher classes
- no-data dashboards
- last-minute setup friction

## 14. Things to Avoid During the Demo

Avoid these unless you already rehearsed them:

- creating teacher data live in front of the audience
- showing empty classes
- using a learner account with no saved scores
- relying on brand-new registration if email confirmation is enabled
- switching to Armenian or Russian without visual QA
- exploring unfinished teacher actions
- describing the teacher dashboard as if it can assign homework or message students

Also avoid overselling:

- parent portal
- homework workflows
- notifications
- grading/report cards
- teacher write actions

Those are not part of the current MVP.

## 15. Troubleshooting

### Problem: The app opens, but login/save does not work

Check:

- `.env.local` exists
- `NEXT_PUBLIC_SUPABASE_URL` is correct
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
- Supabase schema and migrations were applied

### Problem: Register says to confirm email

Cause:

- Supabase email confirmation is enabled

Safe fix:

- use a pre-created learner account for the demo

### Problem: Teacher link does not appear

Check:

- you are logged in as the teacher account
- the teacher profile row has `role = 'teacher'`

Verify in SQL:

```sql
select p.role, u.email
from public.profiles p
join auth.users u on u.id = p.id
where u.email = 'teacher.demo@example.com';
```

### Problem: Teacher dashboard shows no classes

Check:

- the teacher class exists in `public.classes`
- the class belongs to the logged-in teacher

Verify:

```sql
select c.id, c.name, c.teacher_id
from public.classes c
join auth.users u on u.id = c.teacher_id
where u.email = 'teacher.demo@example.com';
```

### Problem: Teacher dashboard loads but looks empty

Check:

- students are enrolled
- students have saved at least one score

Verify enrollments:

```sql
select *
from public.class_enrollments
where class_id = 'PASTE-CLASS-ID-HERE';
```

Verify saved scores:

```sql
select p.display_name, s.game_slug, s.score, s.accuracy, s.created_at
from public.scores s
join public.profiles p on p.id = s.user_id
order by s.created_at desc;
```

### Problem: Teacher route opens but access is denied

Check:

- the logged-in user is actually the teacher account
- the profile role is `teacher`
- the class belongs to that teacher

### Problem: Leaderboard looks unchanged after a learner game

Check:

- the learner clicked `Save score`
- Supabase is connected
- the score row exists

Verify:

```sql
select game_slug, score, accuracy, created_at
from public.scores
where user_id = (
  select id
  from auth.users
  where email = 'student.one@example.com'
)
order by created_at desc;
```

## 16. Final Pre-Demo Checklist

Before presenting, confirm all of these:

- app starts with `npm run dev`
- learner login works
- teacher login works
- teacher nav link appears for teacher only
- at least one learner can save a score
- leaderboard shows real data
- teacher class exists
- teacher roster exists
- teacher dashboard shows non-empty metrics
- class detail page opens
- English is clean
- Armenian and Russian are only shown if already visually approved

If you want the least stressful demo, rehearse the exact clicks once from start to finish right before presenting.
