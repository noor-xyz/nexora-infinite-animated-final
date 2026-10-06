# NEXORA Backend

Express API for the NEXORA frontend. It validates Supabase access tokens, uses Supabase RLS for user-scoped data, and keeps AI secrets server-side.

## Setup

```powershell
cd server
npm install
Copy-Item .env.example .env
```

Fill `.env` with the same Supabase project URL and publishable key used by the frontend. Add `OPENAI_API_KEY` to enable live AI Mentor responses. Without it, the mentor page reports that the server is not configured; it does not return mock responses. Keep this key server-side only.

Run:

```powershell
npm run dev
```

API: `http://localhost:4000`
Health: `http://localhost:4000/api/health`

## Database

Run `supabase/schema.sql` in the Supabase SQL Editor before using authenticated game endpoints.

## API

- `GET /api/health`
- `GET /api/profile` — authenticated
- `PUT /api/profile` — authenticated
- `GET /api/game/summary` — authenticated
- `POST /api/game/mastery/attempt` — authenticated
- `GET /api/game/levels/:worldId/:levelNumber/challenges` — authenticated
- `POST /api/game/challenges/answer` — authenticated; records answers, XP, and level progress transactionally
- `POST /api/mentor` — authenticated
- `GET /api/leaderboard` — authenticated

Authenticated requests require:

`Authorization: Bearer <supabase-access-token>`

Never put `OPENAI_API_KEY` or a Supabase service-role key in the frontend.
