<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

**Product:** Breastfeed Tracker — one Next.js 16 app (`npm run dev` → http://localhost:3000). Auth via Supabase; app data in Postgres via Prisma. There are no automated tests in `package.json`.

### Environment variables

Copy from Supabase (cloud project dashboard or local CLI). Required:

- `DATABASE_URL`, `DIRECT_URL` — Postgres (local Supabase: port **54322**)
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase API (local: **http://127.0.0.1:54321**)
- `NEXT_PUBLIC_SITE_URL` — e.g. `http://localhost:3000` (OAuth/callbacks)

After `.env` exists: `npm run prisma:migrate` (once per fresh DB).

### Local Supabase (recommended for Cloud Agents without hosted secrets)

1. **Docker** must be running (`dockerd` with `fuse-overlayfs` storage driver on this VM). If `permission denied` on `/var/run/docker.sock`, run `sudo chmod 666 /var/run/docker.sock` (or add your user to the `docker` group).
2. `npx supabase init` (only if `supabase/config.toml` is missing), then `npx supabase start` from repo root.
3. `npx supabase status -o env` — map `DB_URL` → `DATABASE_URL` and `DIRECT_URL`, `API_URL` → `NEXT_PUBLIC_SUPABASE_URL`, `ANON_KEY` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Local auth auto-confirms email; use Mailpit at http://127.0.0.1:54324 if needed.

### Commands (see also `README.md`)

| Task | Command |
|------|---------|
| Install / refresh deps | `npm install` (runs `prisma generate` via `postinstall`) |
| Dev server | `npm run dev` |
| Lint | `npm run lint` |
| Production build | `npm run build` |
| DB GUI | `npm run prisma:studio` |

Use **tmux** for long-running `npm run dev`. Do not put `supabase start`, `npm run dev`, or migrations in the VM update script.
