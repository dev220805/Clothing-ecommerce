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

## Deploy on Vercel (recommended: two projects)

Step-by-step guide: **[DEPLOY-VERCEL.md](./DEPLOY-VERCEL.md)**

| Vercel project | Root directory | Key env vars |
|----------------|----------------|--------------|
| **Frontend** | `frontend` | `VITE_API_URL=https://your-api.vercel.app/api` |
| **Backend** | `backend` | `MONGODB_URI`, `JWT_*`, `CLIENT_URL=https://your-frontend.vercel.app` |

Deploy the **backend first**, copy its URL, then set `VITE_API_URL` on the frontend and `CLIENT_URL` on the backend after the frontend is live.

Do **not** leave the Vercel root directory as `.` unless you intentionally want a monorepo deploy.

## CI

See `.github/workflows/ci.yml` for install + build smoke checks.
