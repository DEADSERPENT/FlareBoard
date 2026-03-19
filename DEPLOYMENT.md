# FlareBoard — Deployment Guide

> **Stack:** Supabase (PostgreSQL) + Railway (API) + Vercel (Frontend)

---

## Architecture

```
Browser
  │
  ├── HTTPS → Vercel (React SPA)          apps/web
  │              │ VITE_API_URL
  │              ↓
  └── WSS  → Railway (Express + Socket.IO) apps/api
                   │ DATABASE_URL
                   ↓
              Supabase (PostgreSQL)
```

**Why not Vercel for the backend?**
Vercel Serverless Functions don't support persistent WebSocket connections.
Railway is free (500 hours/month), starts instantly, and supports Socket.IO.

---

## Step 1 — Supabase (Database)

### 1.1 Create Project

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Choose a name, strong password, and region (pick one close to your users)
3. Wait ~2 minutes for provisioning

### 1.2 Get Connection Strings

Go to **Project Settings → Database → Connection string**

You need **two** URLs:

| URL | Where to find it | Used for |
|-----|-----------------|---------|
| `DATABASE_URL` | **Transaction pooler** tab, port `6543` | App queries (via pgBouncer) |
| `DIRECT_URL` | **Direct connection** tab, port `5432` | Prisma migrations |

Copy both. They look like:
```
postgresql://postgres.abcdefgh:YourPassword@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
postgresql://postgres.abcdefgh:YourPassword@aws-0-ap-south-1.pooler.supabase.com:5432/postgres
```

### 1.3 Run Migrations

In your local machine (from `apps/api`):

```bash
# Create a .env file with your Supabase URLs
DATABASE_URL="postgresql://postgres.xxx:password@...pooler...:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxx:password@...direct...:5432/postgres"
JWT_SECRET="your-secret"

# Push schema to Supabase
npx prisma migrate deploy

# OR if no migrations exist yet:
npx prisma db push

# Seed with test data (optional)
npm run db:seed
```

---

## Step 2 — Railway (Backend API)

### 2.1 Create Account & Project

1. Go to [railway.app](https://railway.app) → Sign up with GitHub
2. Click **New Project → Deploy from GitHub repo**
3. Connect your GitHub account and select the `FlareBoard` repo

### 2.2 Configure Root Directory

Railway will detect the monorepo. Set the **Root Directory** to `apps/api`:
- Dashboard → Your service → Settings → **Source** → Root Directory: `apps/api`

### 2.3 Set Environment Variables

Railway Dashboard → Your service → **Variables** → Add all:

```
DATABASE_URL       = postgresql://postgres.xxx:password@pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL         = postgresql://postgres.xxx:password@direct.supabase.com:5432/postgres
JWT_SECRET         = (run: openssl rand -base64 64)
JWT_EXPIRES_IN     = 7d
NODE_ENV           = production
PORT               = 3000
ALLOWED_ORIGINS    = https://your-app.vercel.app
```

> **JWT_SECRET:** Generate a strong secret:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
> ```

### 2.4 Deploy

Railway auto-deploys on push. Watch the **Deploy Logs** — you should see:
```
🔥 FlareBoard API running on port 3000
🔌 WebSocket server ready
📊 Environment: production
```

### 2.5 Get Your Railway URL

After deploy: Settings → **Networking** → Copy the public URL.
Looks like: `https://flareboard-api-production.up.railway.app`

---

## Step 3 — Vercel (Frontend)

### 3.1 Import Project

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import from GitHub → Select `FlareBoard`
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `apps/web`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### 3.2 Set Environment Variables

Vercel Dashboard → Project → **Settings → Environment Variables**

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://flareboard-api-production.up.railway.app/api` |
| `VITE_SOCKET_URL` | `https://flareboard-api-production.up.railway.app` |

> No `/api` at the end of `VITE_SOCKET_URL` — that's just the base server URL.

### 3.3 Deploy

Click **Deploy**. Vercel will:
1. Run `npm run build` in `apps/web`
2. Output to `dist/`
3. Serve the SPA with `vercel.json` rewrites for React Router

Your app will be live at `https://your-project.vercel.app`

### 3.4 Update Railway CORS

Go back to Railway → Variables and update:
```
ALLOWED_ORIGINS = https://your-project.vercel.app
```

Redeploy Railway (push a commit or click **Redeploy**).

---

## Step 4 — Verify Everything Works

### Checklist

```
□ Supabase: can connect with psql or Prisma Studio
□ Railway: /health endpoint returns { status: "ok" }
□ Vercel: homepage loads
□ Login works (admin@flareboard.com / password123)
□ Create a task → appears on Kanban
□ Drag a task → status updates
□ Notifications bell shows count
□ Real-time: open two tabs, update task in one, see it update in the other
```

### Test Railway Health
```bash
curl https://flareboard-api-production.up.railway.app/health
# → {"status":"ok","timestamp":"..."}
```

### Test API Auth
```bash
curl -X POST https://flareboard-api-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@flareboard.com","password":"password123"}'
# → {"success":true,"data":{"token":"...","user":{...}}}
```

---

## Environment Variables Reference

### Backend (`apps/api`)

| Variable | Required | Description |
|----------|---------|-------------|
| `DATABASE_URL` | ✅ | Supabase pooler URL (port 6543) |
| `DIRECT_URL` | ✅ | Supabase direct URL (port 5432) for migrations |
| `JWT_SECRET` | ✅ | Secret for signing JWT tokens (min 32 chars) |
| `JWT_EXPIRES_IN` | ✅ | Token expiry e.g. `7d` |
| `NODE_ENV` | ✅ | `production` |
| `PORT` | ✅ | `3000` (Railway sets this automatically) |
| `ALLOWED_ORIGINS` | ✅ | Your Vercel URL, comma-separated |

### Frontend (`apps/web`)

| Variable | Required | Description |
|----------|---------|-------------|
| `VITE_API_URL` | ✅ | Railway URL + `/api` |
| `VITE_SOCKET_URL` | ✅ | Railway URL (no `/api`) |

---

## Local Development (after Supabase setup)

```bash
# apps/api/.env
DATABASE_URL="postgresql://postgres.xxx:password@pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxx:password@direct.supabase.com:5432/postgres"
JWT_SECRET="any-local-secret"
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173

# apps/web/.env.local
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000

# Then:
npm run dev
```

---

## Updating Production

```bash
git add .
git commit -m "your changes"
git push origin main
# Railway auto-deploys API
# Vercel auto-deploys frontend
```

---

## Free Tier Limits

| Service | Free Tier |
|---------|----------|
| Supabase | 500MB database, 2 projects |
| Railway | $5 free credit/month (~500 hours) |
| Vercel | Unlimited deploys, 100GB bandwidth |

Railway's free credit covers a small API server running 24/7 for about a month.
For sustained usage, upgrade to Railway's **Hobby plan** ($5/month).

---

## Troubleshooting

**CORS errors in browser console**
→ Check `ALLOWED_ORIGINS` in Railway matches your exact Vercel URL (no trailing slash)

**WebSocket connection failed**
→ Check `VITE_SOCKET_URL` has no `/api` suffix
→ Railway must be awake (first request may take 1-2s on free tier)

**Prisma migration errors**
→ Use `DIRECT_URL` for migrations, not the pooler URL
→ Run `npx prisma migrate deploy` from your local machine with the correct `.env`

**"Invalid token" on all API requests**
→ `JWT_SECRET` must be identical in Railway to what was used to generate tokens
→ After changing `JWT_SECRET`, all users need to log in again

**Build fails on Railway**
→ Check `nixpacks.toml` is present in `apps/api`
→ Verify `npm run build` works locally: `cd apps/api && npm run build`
