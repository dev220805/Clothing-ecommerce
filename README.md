# Atlas Commerce

Production-style **MERN** fashion eCommerce stack: **Express + MongoDB** API, **React (Vite) + Redux Toolkit** storefront, **JWT access tokens** with **httpOnly refresh cookies**, optional **Redis** response caching, **Cloudinary** uploads, and **Stripe** PaymentIntent hooks.

## Monorepo layout

| Path | Description |
|------|-------------|
| `backend/` | REST API (`/api/*`), MVC-style folders, validation, rate limits, Helmet, logging |
| `frontend/` | Vite SPA, Tailwind, RTK, code-split routes, skeleton shells |

## Quick start

### 1. MongoDB

Run MongoDB locally or set `MONGODB_URI` to Atlas.

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env — set JWT_ACCESS_SECRET, JWT_REFRESH_SECRET (32+ random chars each)
npm install
npm run seed
npm run dev
```

API: `http://localhost:5000` — health: `GET /api/health`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App: `http://localhost:5173` (proxies `/api` → backend in dev).

Optional `frontend/.env`:

```env
VITE_API_URL=/api
```

### Demo accounts (after seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@atlas.dev` | `Admin123!` |
| User | `demo@atlas.dev` | `Demo12345!` |

Coupons seeded: `WELCOME10`, `SHIPFREE`.

## API overview

Base path: `/api`

| Area | Examples |
|------|----------|
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `POST /auth/forgot-password`, `POST /auth/reset-password`, `POST /auth/verify-email`, `GET /auth/me` |
| Products | `GET /products`, `GET /products/:slug`, `GET /products/suggestions?q=`, `GET /products/categories` |
| Reviews | `GET /products/:slug/reviews`, `POST /products/:slug/reviews` |
| Cart | `GET /cart`, `POST /cart/items`, `PATCH /cart/items/:itemId`, `DELETE /cart/items/:itemId` |
| Wishlist | `GET /wishlist`, `POST /wishlist/toggle` |
| Orders | `POST /orders/preview`, `POST /orders/place`, `POST /orders/payment-intent`, `GET /orders/mine`, `GET /orders/track/:orderNumber`, `GET /orders/recently-viewed` |
| Coupons | `POST /orders/coupons/validate` |
| Admin | `GET /admin/dashboard`, CRUD-style routes under `/admin/*` |
| Uploads | `POST /uploads/images` (multipart, Cloudinary required) |

All authenticated routes expect `Authorization: Bearer <accessToken>`. Refresh uses the `refreshToken` **httpOnly** cookie (`credentials: 'include'` from the SPA).

## Optional services

- **Redis** — set `REDIS_URL` for product list / suggestion caching.
- **Cloudinary** — set `CLOUDINARY_*` for admin image uploads.
- **Stripe** — set `STRIPE_SECRET_KEY`; create PaymentIntent via `POST /orders/payment-intent` then confirm on the client with your publishable key.
- **SMTP** — set `SMTP_*` for real reset/verify emails (otherwise links are logged server-side in dev).

## Frontend performance notes

Designed for strong **mobile Lighthouse** scores: responsive `srcSet`/`sizes` for product and hero images (Unsplash tuned for WebP/`q`; Cloudinary URLs get `f_auto,q_auto,w_*`). Home **Featured** loads in a **lazy chunk** after first paint with `requestIdleCallback` fetch. App routes beyond the homepage are **`React.lazy` + `Suspense`** with skeleton fallbacks; **Removed `framer-motion`** in favor of CSS-only micro-interactions. Google Fonts subset + async stylesheet load; `prefers-reduced-motion` honored globally.

## Backend performance notes

`GET /api/products` (**featured lists** Redis TTL increased), **`/products/suggestions`**, and **`/products/categories`** include **`Cache-Control: s-maxage` + stale-while-revalidate** suitable for CDN/edge caching when `REDIS_URL` keeps origin fast. Invalidate on product/category mutations unchanged.

## Deploy on Vercel (frontend + API together)

This repo is set up for **one Vercel project**: the React app is static, and the Express API runs as a **serverless function** at `/api/*` on the same domain (cookies and auth work without extra CORS setup).

### 1. MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. **Network Access** → allow `0.0.0.0/0` (required for Vercel serverless IPs).
3. Create a database user and copy the connection string.

### 2. Seed the database (run once, from your machine)

```bash
cd backend
cp .env.example .env
# Set MONGODB_URI and JWT secrets in .env
npm install
npm run seed
```

### 3. Deploy to Vercel

1. Push the repo to GitHub.
2. [vercel.com/new](https://vercel.com/new) → import the repository.
3. **Root Directory**: leave as **`.`** (repository root — not `frontend` or `backend`).
4. Vercel reads `vercel.json` automatically (`installCommand`, `buildCommand`, `outputDirectory`, API rewrites).
5. **Environment variables** (Project → Settings → Environment Variables):

| Variable | Required | Notes |
|----------|----------|--------|
| `MONGODB_URI` | Yes | Atlas connection string |
| `JWT_ACCESS_SECRET` | Yes | 32+ random characters |
| `JWT_REFRESH_SECRET` | Yes | 32+ random characters |
| `NODE_ENV` | Yes | `production` |
| `CLIENT_URL` | Recommended | `https://your-domain.vercel.app` (or custom domain). If omitted, `VERCEL_URL` is used. |
| `VITE_API_URL` | Optional | Defaults to `/api` in build |
| `REDIS_URL` | Optional | Caching |
| `CLOUDINARY_*` | Optional | Image uploads |
| `STRIPE_*` | Optional | Payments |
| `SMTP_*` | Optional | Email |

6. Deploy. Open the site → `GET /api/health` should return `{ "ok": true }`.

### How it works

| Path | Served by |
|------|-----------|
| `/`, `/products`, … | `frontend/dist` (SPA, `index.html` fallback) |
| `/api/*` | `api/index.js` → Express app in `backend/src` |

Local dev is unchanged: `npm run dev` in `backend` and `frontend` (Vite proxies `/api` to port 5000).

### Custom domain

Add the domain in Vercel, then set `CLIENT_URL=https://your-custom-domain.com` and redeploy.

### Two separate Vercel projects (optional)

Use **two** Vercel projects if you prefer split URLs:

| Project | Root directory | Config |
|---------|----------------|--------|
| API | `backend` | `backend/vercel.json` |
| Web | `frontend` | `frontend/vercel.json` |

On the **frontend** project, set `VITE_API_URL=https://your-api.vercel.app/api` (build env).  
On the **backend** project, set `CLIENT_URL=https://your-frontend.vercel.app` plus the MongoDB/JWT vars.

The **single root deploy** (default `vercel.json` at repo root) is recommended so `/api` and the SPA share one domain and auth cookies work without extra CORS setup.

## CI

See `.github/workflows/ci.yml` for install + build smoke checks.
