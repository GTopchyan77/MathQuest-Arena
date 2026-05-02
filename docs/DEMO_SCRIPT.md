# MathQuest Arena Demo Script

Version: `v0.8-demo-polished`

Use this as a live presentation script. Keep the pace brisk. Do not improvise into unfinished areas.

## 1. 15-Second Opening Hook

"MathQuest Arena is a browser-based math game platform for learners, with a lightweight teacher dashboard for classroom visibility. In a few minutes, I’ll show a student playing and saving progress, then a teacher viewing class participation and intervention signals from the same live data."

## 2. 5-Minute Demo Flow

1. Show home page
2. Log in as learner
3. Open one game and finish a short round
4. Save score
5. Show dashboard, leaderboard, and profile
6. Log out and log in as teacher
7. Show teacher dashboard
8. Open class detail page
9. Switch language once
10. Close

## 3. Exact Click Path

### Learner

1. `/`
2. `Login`
3. Sign in with learner demo account
4. `Games`
5. `Quick Math Duel`
6. Play round
7. `Save score`
8. `Dashboard`
9. `Leaderboard`
10. `Profile`
11. `Logout`

### Teacher

1. `Login`
2. Sign in with teacher demo account
3. `Teacher Dashboard`
4. Select class if needed
5. `Open class detail`

### Language

1. Click `EN`
2. Click `HY`
3. Click `RU`
4. Return to `EN`

## 4. What To Say On Each Screen

### Home

"This is the entry point. The product is built around short math play, saved progress, and simple classroom visibility."

### Login

"I’m using prepared demo accounts so we can focus on product flow instead of setup."

### Games

"The learner can get into a game quickly. I’ll use the fastest demo path here."

### Game

"This is the learner moment: fast math interaction with very little friction."

### Result / Save Score

"Saving the score turns a quick session into persistent progress."

### Dashboard

"The dashboard answers three questions: what did I do, what improved, and what should I do next."

### Leaderboard

"This gives the learner a replay reason and a lightweight competitive loop."

### Profile

"This is the learner summary view: identity, activity, and progress."

### Teacher Dashboard

"This teacher experience is intentionally read-only. It gives a fast view of participation, class performance, and students who may need support."

### Teacher Class Detail

"This drills into one class with roster, game performance, and a classroom snapshot."

### Language Switch

"The UI can switch across English, Armenian, and Russian for the same product flow."

## 5. What Not To Click

- Do not create teacher data live
- Do not register a brand-new account unless you already know auth is behaving
- Do not wander into empty classes
- Do not oversell teacher features as homework, chat, or notifications
- Do not spend time on unfinished admin workflows
- Do not switch languages on every screen; show it once

## 6. Backup Plan If Supabase/Auth Fails

If login or live data fails:

1. Stay on the home page
2. Open `Games`
3. Open one game page
4. Show the learner UI and language switch only
5. Say:
   "Live persistence and teacher analytics depend on Supabase. If that service is unavailable, I can still show the product flow and interface, but not the live saved-data loop."

If teacher auth fails:

- Do not fake the teacher flow
- Say:
  "The teacher dashboard is live-data-backed, so I’d rather pause there than show misleading information."

## 7. Short Closing Line

"That’s the MVP: fast learner play, saved progress, and a teacher-facing live read-only class view from the same system."
