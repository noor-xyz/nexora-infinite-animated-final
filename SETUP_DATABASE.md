# NEXORA Database — Easy Setup

Follow these steps to set up and verify your database and environment.

## 1. Create the database tables

1. Open your project in Supabase.
2. Navigate to **SQL Editor**.
3. Click **New query**.
4. Open `supabase/schema.sql` from this repository.
5. Copy the entire file content.
6. Paste it into the Supabase SQL Editor.
7. Click **Run**.

The schema script creates tables, triggers, functions, policies, and initial world/chapter/level/challenge seed data. It is idempotent and safe to run again.

### Existing Supabase projects & Migrations

If upgrading an existing database, run migrations in chronological order from `supabase/migrations/`:
1. `supabase/migrations/20261006000000_repair_auth_profile_trigger.sql` — Auth profile creation trigger
2. `supabase/migrations/20261006010000_seed_learning_chapters.sql` — Learning chapters
3. `supabase/migrations/20261006020000_persist_level_challenge_answers.sql` — Answer persistence & transactional XP RPC
4. `supabase/migrations/20261006030000_seed_level_one_beginner_quizzes.sql` — Level 1 beginner quizzes
5. `supabase/migrations/20261006040000_seed_python_levels_two_to_five.sql` — Python Levels 2–5 challenges

## 2. Configure the Server (Backend)

Create the `server/.env` file from `server/.env.example`:

```powershell
cp server/.env.example server/.env
```

Set the values:
- `PORT`: `4000` (or your preferred port)
- `FRONTEND_ORIGIN`: `http://localhost:5173` (for local dev) or your deployed frontend domain (e.g., `https://your-app.vercel.app`)
- `SUPABASE_URL`: Your Supabase Project URL (e.g., `https://your-project.supabase.co`)
- `SUPABASE_PUBLISHABLE_KEY`: Your Supabase Publishable / Anon key
- `OPENAI_API_KEY`: (Optional) Your OpenAI API key for AI Mentor

## 3. Configure the Client (Frontend)

Create the `client/.env` file from `client/.env.example`:

```powershell
cp client/.env.example client/.env
```

Set the values:
- `VITE_SUPABASE_URL`: Your Supabase Project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Your Supabase Publishable / Anon key
- `VITE_API_URL`: Your backend URL (e.g. `http://localhost:4000` for local dev or `https://your-backend.onrender.com` in production)

## 4. Run and Verify Backend

```powershell
cd server
npm install
npm start
```

Verify the health check endpoint:
```powershell
curl http://localhost:4000/api/health
```

Expected response:
```json
{
  "ok": true,
  "service": "nexora-backend",
  "supabaseConfigured": true,
  "databaseConnected": true,
  "databaseMessage": "Supabase database is reachable."
}
```

## 5. Run Client

In a separate terminal:
```powershell
cd client
npm install
npm run dev
```

Open `http://localhost:5173` to test the full application.
