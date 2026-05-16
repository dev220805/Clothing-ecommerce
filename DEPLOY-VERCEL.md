# Deploy on Vercel (frontend + backend as two projects)

Use **two Vercel projects** from the same GitHub repo. Do **not** deploy from the repository root unless you know you want the combined monorepo setup.

## 1. MongoDB Atlas

1. Create a cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. **Network Access** → **Allow access from anywhere** (`0.0.0.0/0`) so Vercel serverless can connect.
3. Create a DB user and copy the connection string.

Seed once from your machine:

```bash
cd backend
cp .env.example .env
# fill MONGODB_URI + JWT secrets
npm install
npm run seed
```

---

## 2. Backend (API) — deploy first

1. [vercel.com/new](https://vercel.com/new) → import your GitHub repo.
2. **Project name**: e.g. `atlas-api`.
3. **Root Directory**: `backend` (required).
4. **Framework Preset**: Other (Vercel reads `backend/vercel.json`).
5. **Environment variables** (Production):

| Variable | Value |
|----------|--------|
| `MONGODB_URI` | Atlas connection string |
| `JWT_ACCESS_SECRET` | 32+ random characters |
| `JWT_REFRESH_SECRET` | 32+ random characters |
| `NODE_ENV` | `production` |
| `CLIENT_URL` | Leave empty for now; set after frontend deploy |

6. Deploy. Test: open `https://YOUR-API.vercel.app/api/health` → `{ "ok": true }`.

Copy the API base URL: `https://YOUR-API.vercel.app/api`

---

## 3. Frontend (web) — deploy second

1. New Vercel project → same repo.
2. **Project name**: e.g. `atlas-shop`.
3. **Root Directory**: `frontend` (required).
4. **Framework Preset**: Vite.
5. **Environment variables** (Production):

| Variable | Value |
|----------|--------|
| `VITE_API_URL` | `https://YOUR-API.vercel.app/api` (no trailing slash) |

6. Deploy. Open the frontend URL and sign in.

---

## 4. Link frontend ↔ backend

1. Open the **backend** project on Vercel → **Settings** → **Environment Variables**.
2. Set `CLIENT_URL` = `https://YOUR-FRONTEND.vercel.app` (no trailing slash).
3. Optional: `ALLOWED_ORIGINS` = same URL plus any preview URLs, comma-separated.
4. **Redeploy** the backend.

Cookies and CORS are configured automatically when the frontend and API hosts differ (`SameSite=None` + `Secure`).

---

## Common deployment mistakes

| Problem | Fix |
|---------|-----|
| **`npm error Missing script: "build"`** | **Root Directory** must be `backend`. Redeploy after pulling latest `backend/package.json` (includes `npm run build`). |
| **No Output Directory / wrong framework** | API project: **Framework** = Other, **Output Directory** = leave **empty** (not `dist`). |
| Build runs from repo root | Set **Root Directory** to `frontend` or `backend` |
| Frontend calls wrong API | Set `VITE_API_URL` to full backend URL ending in `/api` |
| CORS / login fails | Set `CLIENT_URL` on backend to exact frontend origin; redeploy API |
| `MONGODB_URI` errors | Atlas IP allowlist `0.0.0.0/0`; check user/password in URI |
| API 500 on cold start | First request may be slow; check Vercel **Functions** logs |
| `maxDuration` error on Hobby | Limited to 10s (already set in `api/index.js`) |

### Backend project settings (Vercel dashboard)

| Setting | Value |
|---------|--------|
| Root Directory | `backend` |
| Framework Preset | **Other** |
| Build Command | `npm run build` (or leave blank to use `backend/vercel.json`) |
| Output Directory | **empty** |
| Install Command | `npm install` |

---

## Local development (unchanged)

```bash
# terminal 1
cd backend && npm run dev

# terminal 2
cd frontend && npm run dev
```

Frontend uses `VITE_API_URL=/api` and Vite proxies to port 5000.

---

## Optional: single Vercel project (monorepo)

If you want one domain for both SPA and API, use the root `vercel.json` and deploy with **Root Directory** = `.` (repository root). That path is optional; the two-project setup above is what you asked for.
