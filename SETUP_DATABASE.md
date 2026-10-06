# NEXORA Database — Easy Setup

You only need to do two things.

## 1. Create the database tables

1. Open your NEXORA project in Supabase.
2. Open **SQL Editor**.
3. Click **New query**.
4. Open `backend/supabase/schema.sql` from this project.
5. Copy everything in that file.
6. Paste it into Supabase SQL Editor.
7. Click **Run**.

The script is safe to run again if you need to retry.

### Existing Supabase projects

Run `supabase/migrations/20261006020000_persist_level_challenge_answers.sql`
in the SQL Editor to add private, per-user answer records and the transactional
answer/XP/progress function required by the quest flow. The full schema files
include the same database changes for new installations.

To seed the beginner quizzes for the seven Level 1 worlds, run
`supabase/migrations/20261006030000_seed_level_one_beginner_quizzes.sql` in the
SQL Editor after the schema and Level 1 rows exist. It is safe to run again.
Fresh installations using `supabase/schema.sql` receive the same questions
automatically.

To make Python Levels 1–5 playable, run
`supabase/migrations/20261006040000_seed_python_levels_two_to_five.sql` in the
SQL Editor after the schema, Python levels, and chapters exist. It preserves
the existing Level 1 quizzes, seeds five authored challenges each for Levels
2–5, and updates the first five Python level labels and XP rewards. It does not
limit future levels or change other worlds. The migration is safe to run again.

The app loads challenges from `public.challenges`; it does not generate demo
questions. Add authored challenge rows linked to a level's `id`, with `options`
as a JSON array of choice strings and `answer` as the zero-based numeric index
of the correct choice. `prompt`, `explanation`, and nonnegative `xp_reward`
should also be populated. The level becomes complete after all its challenge
rows have been answered.

### Repairing profile creation on an existing project

If Auth signup succeeds but a user has no matching row in `public.profiles`,
open `supabase/migrations/20261006000000_repair_auth_profile_trigger.sql` and
run its contents in the Supabase SQL Editor. This reinstalls the
`auth.users` trigger with a locked-down `SECURITY DEFINER` function and creates
profiles for existing Auth users who are still missing one. It is safe to run
again. Do not create profiles from the frontend or disable row-level security.

## 2. Connect the backend

Create this file:

`backend/.env`

Copy the contents of `backend/.env.example` into it and replace:

- `SUPABASE_URL` with your Supabase Project URL
- `SUPABASE_PUBLISHABLE_KEY` with your Supabase Publishable key

Do NOT put a service-role key in the frontend. Do NOT commit `.env`.

## 3. Connect the frontend

At the project root, create `.env` from `.env.example` and set:

- `VITE_SUPABASE_URL` to the same Supabase project root URL (do not append `/rest/v1`)
- `VITE_SUPABASE_PUBLISHABLE_KEY` to the same publishable key

The frontend uses Supabase Auth directly; without these values, it runs in demo
mode and does not create real accounts.

## 4. Start the backend

From the `backend` folder:

```powershell
npm install
npm run dev
```

You should see:

`NEXORA backend running on http://localhost:4000`

## 5. Test the database connection

Open:

`http://localhost:4000/api/health`

You want to see:

```json
{
  "ok": true,
  "supabaseConfigured": true,
  "databaseConnected": true
}
```

If `databaseConnected` is false, the `databaseMessage` tells you what to fix.

## 6. Start the frontend

In a second terminal, from the project root:

```powershell
npm run dev
```

Then open the Vite URL.
