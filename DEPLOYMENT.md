# Deployment (Free-tier friendly)

This repo has:
- Laravel backend (root)
- Vite/React frontend (`frontend/`)

The frontend reads the API base URL from `VITE_API_URL` and defaults to `/api`.
That means you have two clean deployment patterns:

## Option A (recommended): Frontend static hosting + Backend PHP hosting

### Option A (recommended): Shared PHP hosting (aHost/cPanel) + Netlify (frontend)

This is a common practical combo for this repo:
- Backend: Shared PHP hosting (e.g., aHost/cPanel) with PHP + MySQL
- Frontend: Netlify (static hosting)

The repo already includes Netlify SPA routing config:
- `frontend/public/_redirects`
- `frontend/netlify.toml`

### A1) Backend on shared PHP hosting (aHost / cPanel)
Works with providers that support **PHP + MySQL + Composer** (or allow uploading `vendor/`).

**Backend steps**
1. Create a MySQL database + user.
2. Upload the Laravel project to hosting (File Manager or FTP).
3. Make sure the domain/subdomain document root points to Laravel `public/`.
    - A clean pattern is:
       - Upload the project into a folder like `hotel/`
       - Create a (sub)domain that points to `hotel/public`
       This keeps `.env`, `app/`, `vendor/` out of the web root.
4. Set environment variables (or `.env` if allowed):
   - `APP_ENV=production`
   - `APP_DEBUG=false`
   - `APP_KEY=...` (generate locally)
   - `APP_URL=https://YOUR_BACKEND_DOMAIN`
   - `DB_CONNECTION=mysql`
   - `DB_HOST=...`
   - `DB_DATABASE=...`
   - `DB_USERNAME=...`
   - `DB_PASSWORD=...`
   - Security knobs you already have:
     - `FORCE_HTTPS=true`
     - `SESSION_SECURE_COOKIE=true`
   - `CORS_ALLOWED_ORIGINS=https://YOUR_NETLIFY_DOMAIN` (add any other frontend domains you use)
     - `HSTS_ENABLED=true` (only if HTTPS is correctly configured)
     - `ADMIN_PASSWORD=...` (required in production)

**One-time commands (run locally or via SSH if host supports it)**
- Install deps: `composer install --no-dev --optimize-autoloader`
- Generate key: `php artisan key:generate`
- Migrate: `php artisan migrate --force`
- (Optional) Seed: `php artisan db:seed --force`
- Link storage: `php artisan storage:link`
- Cache config/routes/views: `php artisan config:cache && php artisan route:cache && php artisan view:cache`

If the host does not allow running `composer`/`artisan`, you can:
- Build locally, upload the `vendor/` folder, and upload a ready `.env`.
- Run migrations locally and then import the DB using phpMyAdmin (practical on shared hosts):
   1) Locally: configure `.env` for local DB, run `php artisan migrate --force` (and seed if needed)
   2) Export SQL from your local DB
   3) Import the SQL into the hosted database via phpMyAdmin

### A2) Frontend on static hosting (free)
Works with Netlify / Vercel / Cloudflare Pages / GitHub Pages (free tiers vary).

**Netlify steps (recommended)**
1. Push your repo to GitHub.
2. Netlify → “Add new site” → “Import from Git”.
3. Build settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
   (This is also defined in `frontend/netlify.toml`.)
4. Netlify Environment variables:
   - `VITE_API_URL=https://YOUR_BACKEND_DOMAIN/api`
5. Deploy.

**SPA routing note**
Because this is a React SPA, configure the host to rewrite all routes to `/index.html`.
- Netlify: `frontend/public/_redirects` is already included: `/*  /index.html  200`
- Vercel: add a rewrite rule to `index.html`

## Option B: Single domain (no CORS) by serving frontend from Laravel

This removes cross-domain CORS headaches but requires wiring the frontend build output into Laravel’s `public/`.
Only do this if you specifically want a single-domain deployment.

High-level:
1. Build frontend.
2. Copy `frontend/dist/*` into Laravel `public/` (or a subfolder) and ensure SPA rewrites.

(If you want this option, ask and we can implement a clean, repeatable build/copy script.)

## Quick checklist (production)
- `APP_DEBUG=false`
- Use HTTPS; enable `FORCE_HTTPS=true`
- Set `CORS_ALLOWED_ORIGINS` exactly to your Netlify domain
- Configure mail settings if you need emails
- Ensure `storage/` is writable and `storage:link` exists
