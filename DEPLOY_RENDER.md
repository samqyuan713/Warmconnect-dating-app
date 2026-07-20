# WarmConnect - Render.com Deployment Guide

## Overview
This guide deploys the full WarmConnect dating app on Render.com's free tier:
- **Backend**: Docker-based web service (FastAPI)
- **Frontend**: Static site (React build → CDN)
- **Database**: Managed PostgreSQL (free tier)

All three run on Render with **zero external dependencies** and **no payment required**.

---

## What You Get (Free Tier)

| Service | Specs | Limitations |
|---------|-------|-------------|
| Web Service (Backend) | 512 MB RAM, shared CPU | Sleeps after 15 min idle (30s cold start) |
| Static Site (Frontend) | CDN, unlimited bandwidth | None |
| PostgreSQL | 1 GB storage, shared CPU | Expires after 90 days (can recreate) |

---

## Step 1: Sign Up

1. Go to https://render.com
2. Click **Get Started for Free**
3. Sign up with **GitHub** (easiest — auto-connects repos)
4. **No credit card required**

---

## Step 2: Push Your Code to GitHub

```bash
cd warmconnect-dating-app

# Initialize git (if not already)
git init
git add .
git commit -m "Ready for Render deployment"

# Create repo on GitHub (via web UI or gh CLI)
# Then push:
git remote add origin https://github.com/YOUR_USERNAME/warmconnect.git
git push -u origin main
```

---

## Step 3: Create PostgreSQL Database

1. In Render dashboard, click **New** → **PostgreSQL**
2. Configure:
   - **Name**: `warmconnect-db`
   - **Database**: `dating_db`
   - **User**: `dating_user`
   - **Region**: Choose closest to you (Oregon or Frankfurt)
   - **Plan**: **Free**
3. Click **Create Database**
4. Wait ~2 minutes for it to provision
5. Copy the **Internal Database URL** (looks like: `postgresql://dating_user:password@host:5432/dating_db`)

---

## Step 4: Create Backend Web Service

1. Click **New** → **Web Service**
2. Connect your GitHub repo `warmconnect`
3. Configure:

| Setting | Value |
|---------|-------|
| Name | `warmconnect-api` |
| Region | Same as database |
| Branch | `main` |
| Runtime | **Docker** |
| Docker Build Context | `./backend` |
| Docker Command | *(leave blank — uses Dockerfile CMD)* |
| Plan | **Free** |

4. Click **Advanced** and add Environment Variables:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | *(paste the Internal Database URL from Step 3)* |
| `SECRET_KEY` | *(generate: `openssl rand -hex 32` on your Mac)* |

5. Click **Create Web Service**
6. Wait for build (~3-5 minutes)
7. Note the URL: `https://warmconnect-api.onrender.com`

---

## Step 5: Create Frontend Static Site

1. Click **New** → **Static Site**
2. Connect the same GitHub repo
3. Configure:

| Setting | Value |
|---------|-------|
| Name | `warmconnect-web` |
| Region | Same as backend |
| Branch | `main` |
| Build Command | `cd frontend && npm install && npm run build` |
| Publish Directory | `frontend/dist` |
| Plan | **Free** |

4. Click **Advanced** and add Environment Variable:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://warmconnect-api.onrender.com` |

5. Click **Create Static Site**
6. Wait for build (~2-3 minutes)
7. Your app is live at: `https://warmconnect-web.onrender.com`

---

## Step 6: Update CORS (Important!)

Your backend currently only allows `localhost`. You need to update it for Render.

Edit `backend/main.py` and change the CORS origins:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://warmconnect-web.onrender.com",  # ADD THIS
        "https://*.onrender.com",  # Or use this wildcard
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Commit and push — Render will auto-redeploy:
```bash
git add backend/main.py
git commit -m "Update CORS for Render"
git push origin main
```

---

## Architecture on Render

```
User Browser
     |
     v
+-----------------------------+
|  Static Site (CDN)          |
|  warmconnect-web.onrender   |
|  React SPA served globally  |
+-------------+---------------+
              |  /api/* requests
              v
+-----------------------------+
|  Web Service                |
|  warmconnect-api.onrender   |
|  FastAPI + Docker           |
+-------------+---------------+
              |  SQL queries
              v
+-----------------------------+
|  PostgreSQL                 |
|  warmconnect-db             |
|  Managed, auto-backed-up    |
+-----------------------------+
```

---

## Important: Free Tier Limitations

| Limitation | Workaround |
|-----------|-----------|
| **Web service sleeps after 15 min idle** | First request after idle takes ~30s cold start. Subsequent requests are fast. |
| **PostgreSQL expires after 90 days** | Render emails you before expiry. Create a new DB and migrate data, or upgrade to paid ($7/month). |
| **512 MB RAM** | Your app fits fine. If you add image processing later, you may need to upgrade. |
| **Build time limits** | Free tier has 15 min build limit. Your app builds in ~3 min. |

---

## Custom Domain (Optional)

1. Buy a domain (Namecheap, Cloudflare, etc.)
2. In Render dashboard → your static site → **Settings** → **Custom Domain**
3. Add your domain (e.g., `warmconnect.app`)
4. Render gives you DNS records to add at your registrar
5. Auto SSL certificate provided by Render

---

## Monitoring & Logs

```
# View logs in Render dashboard:
Dashboard → Service → Logs

# Or use Render CLI:
npm install -g @render/cli
render logs --service warmconnect-api
```

---

## Updating Your App

Just push to GitHub — Render auto-deploys:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Render will:
1. Rebuild backend (if Dockerfile or backend code changed)
2. Rebuild frontend (if frontend code changed)
3. Zero-downtime deploy

---

## Troubleshooting

### "Build failed" on backend
```bash
# Check Dockerfile is in backend/ folder
# Ensure requirements.txt has no conflicting versions
# Check Render logs for specific error
```

### "Cannot connect to database"
```bash
# Verify DATABASE_URL is correct (Internal URL, not External)
# Check if database is in same region as backend
# Try restarting backend service in Render dashboard
```

### "CORS error" in browser
```bash
# Make sure your frontend URL is in allow_origins in main.py
# Wildcard `*.onrender.com` usually works
# Clear browser cache and retry
```

### "Frontend shows blank page"
```bash
# Check browser console for errors
# Verify VITE_API_URL is set correctly in static site env vars
# Ensure build command outputs to frontend/dist
```

---

## Cost After Free Tier

If you want to remove limitations later:

| Upgrade | Cost | Benefit |
|---------|------|---------|
| Web Service → Starter | $7/month | Never sleeps, 512MB RAM |
| PostgreSQL → Starter | $7/month | 1GB storage, never expires |
| Static Site | **Always free** | No upgrade needed |
| **Total** | **$14/month** | Production-ready |

---

## Why Render vs Others?

| | Render | Railway | Heroku | Fly.io |
|---|--------|---------|--------|--------|
| Free tier | Yes | Yes (~$5 credit) | Yes (limited) | Yes |
| Credit card required | **No** | No | No | No |
| Native Docker | Yes | Yes | No | Yes |
| Static sites | **Yes (free CDN)** | No | No | No |
| Managed Postgres | **Yes (free)** | Yes | Yes | No |
| Sleep on idle | Yes (15 min) | No | Yes (30 min) | No |
| Easiest setup | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ |

**Render wins for your case** because it handles static sites natively (perfect for React), has a generous free PostgreSQL tier, and requires zero payment info.

---

Happy deploying!
