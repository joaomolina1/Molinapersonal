<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

**Product:** RINU — a single Next.js 15 (App Router) marketplace for event spaces/services. Backend is Supabase (Auth + Postgres + Storage); the REST API lives in-app under `/api/{service}/v1/...` (and `/api/public/{service}/v1/...`). Stripe/Brevo/Google Maps are optional integrations. There are no automated tests; `npm run lint`, `npm run build`, and `npm run dev` are the checks (see `README.md` / `package.json`).

### Running the app (local Supabase backend)
The dev environment uses a **local Supabase stack** (Docker), not the hosted `rinu.pt` project — never point dev/tests at production. Order matters:

1. Ensure the Docker daemon is running (`docker info`). On this VM dockerd runs in a tmux session, not systemd; if `permission denied` on the socket, `sudo chmod 666 /var/run/docker.sock`.
2. `supabase start` from the repo root (applies `supabase/migrations/*` automatically). Then `npm run dev` (→ http://localhost:3000). Use **tmux** for both long-running processes.
3. `.env` is gitignored and must point at the local stack: map `supabase start` output `API_URL`→`NEXT_PUBLIC_SUPABASE_URL`, `ANON_KEY`→`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SERVICE_ROLE_KEY`→`SUPABASE_SERVICE_ROLE_KEY`; set `NEXT_PUBLIC_SITE_URL=http://localhost:3000`. Missing required Supabase vars throw at import (`lib/env.ts`).

### Non-obvious gotchas
- **`supabase/config.toml` sets `auto_expose_new_tables = true`** on purpose. The local Supabase default flipped to `false` (≥2026-05-30), which causes `permission denied for table ...` (e.g. `packs_spaces`) for the Data API roles because the migrations rely on the legacy auto-grant behaviour that production was built under. Keep it `true`; after changing it run `supabase db reset`.
- Auth: `NEXT_PUBLIC_ENABLE_EMAIL_VALIDATION=0` (default) → register creates a pre-confirmed user via the admin API, so login works immediately even though the UI shows a "verification email sent" message. Local mail is viewable in Mailpit (`supabase status` → `MAILPIT_URL`).
- A fresh DB has no venues/spaces, so search/home return empty result sets — that is expected, not a bug.
- Do not put `supabase start`, `npm run dev`, migrations, or Docker/CLI installation in the VM update script (the update script only refreshes app deps).
