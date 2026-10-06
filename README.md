# NEXORA — Full Stack Technical Learning Platform

NEXORA is a gamified technical-learning platform featuring interactive worlds, challenge progression, level mastery, AI Mentor guidance, and leaderboards.

---

## 🏗️ Architecture

```
NEXORA/
├── client/                 # React + Vite frontend → Vercel
│   ├── public/             # Static public assets
│   ├── src/                # Frontend source (components, pages, context, services)
│   ├── .env.example        # Client environment variable template
│   ├── index.html          # Single-page application entry HTML
│   ├── package.json        # Client package configuration & dependencies
│   └── vite.config.js      # Vite build and proxy configuration
├── server/                 # Express backend → Render
│   ├── src/                # Backend API (routes, middleware, services, utils, lib)
│   ├── .env.example        # Server environment variable template
│   ├── package.json        # Server package configuration & dependencies
│   └── README.md           # Backend documentation
├── supabase/               # Database schema & migrations
│   ├── migrations/         # Supabase SQL migrations
│   └── schema.sql          # Complete baseline database schema & seeds
├── render.yaml             # Render Blueprint configuration for server
├── .gitignore              # Project-wide gitignore
├── SETUP_DATABASE.md       # Database setup guide
├── README.md               # Project documentation
└── package.json            # Root workspace scripts
```

---

## 🚀 Quick Start

### 1. Database Setup
Follow the instructions in [SETUP_DATABASE.md](./SETUP_DATABASE.md) to apply `supabase/schema.sql` to your Supabase project.

### 2. Server Setup
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, and FRONTEND_ORIGIN
npm run dev
```

### 3. Client Setup
```bash
cd client
npm install
cp .env.example .env
# Edit .env with your VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, and VITE_API_URL
npm run dev
```

### Root Scripts (Convenience)
From the root directory:
- `npm run client:dev`: Start client dev server
- `npm run client:build`: Build client production bundle
- `npm run client:lint`: Lint client code
- `npm run server:dev`: Start backend with file watching
- `npm run server:start`: Start backend in production mode
- `npm run server:lint`: Lint/check backend code
- `npm run install:all`: Install dependencies for both client and server

---

## 🌐 Deployment Guide

### Frontend Deployment (Vercel)
- **Root Directory**: `client`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_SUPABASE_URL`: `https://YOUR_SUPABASE_PROJECT.supabase.co`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`: `YOUR_SUPABASE_PUBLISHABLE_KEY`
  - `VITE_API_URL`: `https://YOUR_RENDER_BACKEND_URL`

### Backend Deployment (Render)
- Deploy using Blueprint with `render.yaml` or manually:
  - **Root Directory**: `server`
  - **Build Command**: `npm install`
  - **Start Command**: `npm start`
  - **Health Check Path**: `/api/health`
  - **Environment Variables**:
    - `NODE_ENV`: `production`
    - `PORT`: `4000` (or dynamic port assigned by Render)
    - `FRONTEND_ORIGIN`: `https://YOUR_VERCEL_DOMAIN`
    - `SUPABASE_URL`: `https://YOUR_SUPABASE_PROJECT.supabase.co`
    - `SUPABASE_PUBLISHABLE_KEY`: `YOUR_SUPABASE_PUBLISHABLE_KEY`
    - `OPENAI_API_KEY`: *(Optional)* Your OpenAI API key for live AI Mentor

---

## 🔒 Security Best Practices
- Never commit real `.env` files or API secrets.
- Server-side secrets (`OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are kept exclusively on the server and never exposed to the client.
- Client only uses public/anon keys (`VITE_SUPABASE_PUBLISHABLE_KEY`).
