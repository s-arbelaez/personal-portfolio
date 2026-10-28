# Personal Portfolio

A full-stack portfolio for Sofía Arbeláez Mejía. Production hosting uses Cloudflare Workers for the API and static frontend, D1 for relational data, and R2 for certificate PDFs.

## Project structure

- `frontend/` — React + Vite + TypeScript frontend
- `backend/src/worker.ts` — Cloudflare Worker API
- `backend/migrations/` — D1 SQL migrations
- `backend/uploads/certificates/` — local PDF source files to copy to R2
- `backend/src/server.ts` — existing Express/Prisma server for legacy local development
- `wrangler.jsonc` — Worker, static asset, D1, and R2 configuration

## Cloudflare resources

Create a D1 database and an R2 bucket, then update the D1 `database_id` in `wrangler.jsonc` with the ID returned by Cloudflare:

```powershell
npx wrangler d1 create personal-portfolio
npx wrangler r2 bucket create personal-portfolio-uploads
```

Apply the schema:

```powershell
npx wrangler d1 migrations apply personal-portfolio --remote
```

Set the one-time admin bootstrap password. On the first successful login the Worker stores a PBKDF2 password hash in D1; remove the bootstrap secret after verifying that login works:

```powershell
npx wrangler secret put ADMIN_PASSWORD
npm run deploy:cloudflare
```

```powershell
npx wrangler secret delete ADMIN_PASSWORD
```

## Migrating existing content and certificates

The D1 schema is compatible with the existing Prisma SQLite content tables. The migration deliberately excludes old user and session rows: existing passwords use Argon2, which is not supported by this Workers implementation, so create the admin account with the one-time bootstrap password instead.

To copy content from the local database, export it to SQL and apply the SQL to the new D1 database:

```powershell
python backend/scripts/export-sqlite-to-d1.py backend/prisma/dev.db --output backend/d1-content-import.sql
npx wrangler d1 execute personal-portfolio --remote --file=backend/d1-content-import.sql
```

The export script excludes users and sessions. The generated SQL file is ignored by Git.

Certificate objects are stored in R2 under `certificates/`. Copy existing local PDFs after creating the R2 bucket:

```powershell
Get-ChildItem -LiteralPath 'backend\uploads\certificates' -Filter '*.pdf' -File | ForEach-Object {
  npx wrangler r2 object put "personal-portfolio-uploads/certificates/$($_.Name)" --file="$($_.FullName)" --remote
}
```

This keeps existing `/uploads/certificates/...` database URLs working. New uploads made through the admin content manager are stored directly in R2.

## Development and deployment

Install dependencies with `npm install`, then run:

```powershell
npm run dev
```

This builds the static assets, starts Vite on port 5173, and starts the Worker on port 8787. Vite proxies `/api` and `/uploads` to the Worker. Local D1/R2 emulation is managed by Wrangler; apply the migration locally with:

```powershell
npx wrangler d1 migrations apply personal-portfolio --local
```

Build and validate the frontend/Worker bundle with `npm run build:cloudflare`. Deploy with `npm run deploy:cloudflare`. The deployed Worker serves both the site and API from one origin, so `VITE_API_BASE_URL` should normally remain unset (the frontend uses `/api`).

## Notes

- Password recovery currently returns a generic response and does not send email; configure an email provider before enabling real recovery.
- Google sign-in remains unavailable until OAuth is configured.
- The legacy Express/Prisma server remains available via `npm run dev:backend`; production deployment uses the Worker entry point.
- Only factual profile, education, experience, project, and certification details should be published.
