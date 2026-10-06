# NEXORA — Full Stack

NEXORA is an AI-powered gamified technical-learning platform.

## Fast setup

### 1. Database

Follow `SETUP_DATABASE.md`. It contains the simple Supabase setup and connection test.

### 2. Backend

Create `backend/.env` from `backend/.env.example` and set your Supabase project URL
(the project root URL, not `/rest/v1`) and publishable key.

```powershell
cd backend
npm install
npm run dev
```

### 3. Frontend

At the project root, create `.env` from `.env.example` and set the same
Supabase project URL and publishable key. Never use a service-role key in the
frontend.

Open a second terminal at the project root:

```powershell
npm install
npm run dev
```

Do not commit `.env` files or API secrets.


## NEXORA progression architecture

Every skill/world is designed for **Level 1 → ∞**. The database stores levels by `(world_id, level_number)` and has no fixed upper limit. The starter schema seeds the first 20 levels for each world; additional levels can be inserted or generated later without changing the frontend. The World screen also supports incremental loading of 20 more levels at a time.

### Motion & visual system

NEXORA uses lightweight CSS 3D-style effects, animated particles, orbits, glows, floating cards, page micro-interactions, and reduced-motion support. No WebGL dependency is required for the core experience, keeping the landing page performant on mobile devices.

### Database

Run `supabase/schema.sql` in the Supabase SQL editor. It creates the world/chapter/level/challenge/boss foundation, RLS policies, seed worlds/achievements/levels, profile trigger, and leaderboard RPC.

Never commit `.env` files or service-role credentials. Copy `.env.example` to `.env` locally.
