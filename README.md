# Personal Portfolio

A full-stack portfolio for Sofía Arbeláez Mejía built with:

- Frontend: React + Vite + TypeScript
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL + Prisma
- Admin: secured private dashboard with content management capabilities

## Structure

- `frontend/` — public portfolio frontend
- `backend/` — API, auth and content management layer
- `docs/` — project notes and architecture documentation

## Important constraints

- No fabricated professional experience, metrics, certifications or company names.
- All portfolio content must be factual and aligned with the real profile.
- Calendar / availability is managed through admin-configurable data rather than hardcoded placeholders.

## Setup

1. Install dependencies for both applications.
2. Configure the backend environment using the `.env.example` file.
3. Sync Prisma; the default setup uses a local SQLite database and does not require PostgreSQL.
4. Create the local admin account with a password that is never committed:
	`cd backend && $env:ADMIN_PASSWORD="your-local-password"; npm run admin:create`
5. Run the frontend and backend development servers.

## Commands

- Root convenience scripts are defined in the root `package.json`.
- Frontend: `cd frontend && npm install && npm run dev`
- Backend: `cd backend && npm install && npm run dev`

The admin email defaults to `sofia.arbelaez.mejia@gmail.com`. The backend reads `backend/.env`; copy
`.env.example` if it does not exist. The default SQLite database is stored at `backend/prisma/dev.db`.
Password recovery and Google sign-in require email/OAuth provider credentials before they can send or authenticate.

## Deployment

Deploy the backend as a separate Node.js service because it runs an Express server and uses Prisma. Set its production environment variables from `backend/.env.example`, including a persistent production database, `NODE_ENV=production`, and the public Vercel URL as `CLIENT_URL`.

In the Vercel project for `frontend/`, set `VITE_API_BASE_URL` to the deployed backend URL ending in `/api`, for example `https://api.example.com/api`, then redeploy. Vite embeds `VITE_*` variables during the build, so changing the variable requires a new deployment. Do not use `localhost` in the Vercel value.
