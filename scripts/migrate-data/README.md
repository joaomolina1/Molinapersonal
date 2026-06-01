# RINU data migration guide

This folder is for scripts and inputs used when migrating production data from the legacy RINU microservices stack into the consolidated Supabase database.

Apply the schema first with `supabase db push` (or `supabase migration up`) so `001_initial_schema.sql` is in place before importing any data.

## What you need to provide

### 1. Postgres dumps from RINU services

Export **data only** (`--data-only`) from each legacy service database. Do **not** import auth-service tables; Supabase Auth replaces that layer.

| Service   | Schema / DB   | Tables to export |
|-----------|---------------|------------------|
| **users** | `users`       | `users`, `watchlist` |
| **venues**| `venues`      | `venues`, `spaces`, `packs`, `packs_spaces`, `highlights` |
| **bookings** | `bookings` | `bookings`, `payments`, `icals_exports`, `icals_imports`, `quote`, `contact_request` |
| **photos** | `photos`     | `photos`, `attachments` |
| **reviews** | `reviews`   | `review` |

**Skip:** `places` (seeded in the migration), auth service (`tokens`, `confirmations`, `password_resets`, auth `users`).

Example export (adjust connection strings):

```bash
pg_dump "$USERS_DB_URL" --data-only --table=users --table=watchlist -f dumps/users.sql
pg_dump "$VENUES_DB_URL" --data-only \
  --table=venues --table=spaces --table=packs --table=packs_spaces --table=highlights \
  -f dumps/venues.sql
pg_dump "$BOOKINGS_DB_URL" --data-only \
  --table=bookings --table=payments --table=icals_exports --table=icals_imports \
  --table=quote --table=contact_request \
  -f dumps/bookings.sql
pg_dump "$PHOTOS_DB_URL" --data-only --table=photos --table=attachments -f dumps/photos.sql
pg_dump "$REVIEWS_DB_URL" --data-only --table=review -f dumps/reviews.sql
```

Place dump files under `scripts/migrate-data/dumps/` (create the folder locally; it is gitignored if you add it to `.gitignore`).

**Import order** (respect foreign keys after ID remapping):

1. `auth.users` + `profiles` (see ID remapping below)
2. `venues` → `spaces` → `packs` → `packs_spaces` → `highlights`
3. `photos`, `attachments`
4. `bookings` → `payments`
5. `icals_exports`, `icals_imports`
6. `quote`, `contact_request`
7. `watchlist`
8. `review`

Use the Supabase SQL editor or `psql` against the project database with the **service role** (RLS bypassed) for bulk imports.

### 2. GCP bucket files

Legacy photo and attachment URLs point at Google Cloud Storage. Provide:

| Asset | Legacy env | What to export |
|-------|------------|----------------|
| Venue/space/pack photos | `GCP_PHOTO_BUCKET`, `GCP_CDN_URL` | Full bucket contents (original + resized variants if stored separately) |
| Pack attachments | Same bucket or paths in `packs.attachments` | Files referenced by UUID/path in DB |

Steps:

1. Download the production bucket (e.g. `gsutil -m cp -r gs://YOUR_BUCKET ./gcp-export/`).
2. Upload objects to **Supabase Storage** (recommended bucket: `photos`) or your new CDN origin.
3. Build a URL mapping file (`old_url → new_url`) and run an update script on:
   - `venues.primary_photo`, `venues.photos`
   - `spaces.primary_photo`, `spaces.photos`
   - `packs.primary_photo`, `packs.photos`, `packs.attachments`
   - `photos.url`, `photos.large_url`, `photos.medium_url`, `photos.small_url`
   - `attachments.url`
   - `review.photos` (array)

Keep `GCP_CREDENTIALS` (service account JSON) only for the one-time migration; do not commit it.

### 3. API keys and third-party credentials

Rotate keys when moving to the new stack. Provide values for `.env` (see root `.env.example`):

| Provider | Variables | Notes |
|----------|-----------|-------|
| **Stripe** | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Re-register webhook URL on the new Next.js `/api` routes; payment rows keep `external_id` from Stripe |
| **Brevo** | `BREVO_API_KEY`, optional `BREVO_URL`, `BREVO_DEAL_PIPELINE_ID`, `BREVO_CONTACT_PIPELINE_ID` | Used for CRM/deal sync on bookings and leads |
| **Google Maps** | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` | Restrict keys to your production domain |

Also configure **Supabase** (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) in the Supabase dashboard.

---

## ID remapping: users and auth migration

Legacy RINU split identity across two databases:

- **auth service** — credentials, sessions, tokens (discarded; use Supabase Auth)
- **users service** — profile row keyed by the same UUID as auth `users.id`

In Supabase, **`profiles.id` must equal `auth.users.id`**. Every `owner_id`, `user_id`, and watchlist reference must point at the new auth user UUID.

### Recommended approach

1. **Export legacy users** from the users service (`id`, `email`, `name`, `roles`, `kind`, `date_of_birth`, `created_at`, `updated_at`, `deleted_at`). Join or merge with auth export for `email` if needed.

2. **Create a mapping table** (temporary, in a migration session):

   ```sql
   CREATE TEMP TABLE user_id_map (
     old_id UUID PRIMARY KEY,
     new_id UUID NOT NULL,
     email   TEXT NOT NULL
   );
   ```

3. **For each user**, create a Supabase Auth user (Admin API or `supabase.auth.admin.createUser`):

   - Set `email`, `email_confirm: true` for already-confirmed accounts
   - Set `user_metadata.name` from legacy `name`
   - Optionally set a random password and force password reset on first login
   - Record `new_id` returned by Supabase in `user_id_map`

4. **Insert profiles** (disable `on_auth_user_created` trigger temporarily if you bulk-insert, or let the trigger run and then `UPDATE` extra columns):

   ```sql
   INSERT INTO public.profiles (id, name, roles, kind, date_of_birth, created_at, updated_at, deleted_at)
   SELECT m.new_id, u.name, u.roles, COALESCE(u.kind, ''), u.date_of_birth, u.created_at, u.updated_at, u.deleted_at
   FROM legacy_users u
   JOIN user_id_map m ON m.old_id = u.id;
   ```

5. **Rewrite foreign keys** before loading dependent tables:

   | Column | Tables |
   |--------|--------|
   | `owner_id` | `venues`, `spaces`, `packs`, `photos`, `attachments`, `icals_exports`, `icals_imports` |
   | `user_id` (UUID) | `bookings`, `payments`, `watchlist` |
   | `user_id` (TEXT) | `quote`, `contact_request` — replace old UUID string with new UUID string where present |
   | `owner_id` (TEXT) | `review` — map to `new_id::text` if reviews should stay linked to authors |

   Example:

   ```sql
   UPDATE staging.venues v
   SET owner_id = m.new_id
   FROM user_id_map m
   WHERE v.owner_id = m.old_id;
   ```

6. **Watchlist** — legacy `user_id` was `text`; cast through the map:

   ```sql
   UPDATE staging.watchlist w
   SET user_id = m.new_id
   FROM user_id_map m
   WHERE w.user_id::uuid = m.old_id;
   ```

7. **Do not import** legacy `users.confirmed`; use `auth.users.email_confirmed_at` instead.

8. **Preserve UUIDs where possible** — if you use `createUser` with a fixed `id` (Admin API supports this), you can skip remapping for tables that already store UUIDs. Only auth password hashes cannot be migrated; users must reset passwords or use magic link.

### Columns that stay as TEXT (no FK)

These intentionally store opaque IDs or anonymous submissions:

- `icals_exports.space_id`, `icals_imports.space_id`
- `quote.venue_id`, `quote.space_id`, `quote.pack_id`, `quote.user_id`
- `contact_request.*_id`, `contact_request.user_id`
- `review.owner_id` (unless you normalize to UUID)
- `watchlist.spaces` (array of space id strings)

Validate that TEXT values still match existing UUID rows after import.

---

## Suggested folder layout

```
scripts/migrate-data/
├── README.md          (this file)
├── dumps/             (your pg_dump files — local only)
├── gcp-export/        (downloaded bucket — local only)
├── url-map.csv        (old_url,new_url)
└── remap-users.sql    (optional helper SQL using user_id_map)
```

---

## Verification checklist

- [ ] Row counts match legacy DBs per table
- [ ] Every `profiles.id` exists in `auth.users`
- [ ] No orphan `owner_id` / `user_id` on venues, spaces, packs, bookings
- [ ] Photo URLs load in the app (spot-check venues, spaces, packs)
- [ ] Stripe webhook receives events on the new endpoint
- [ ] Brevo test contact/deal creation succeeds
- [ ] Maps render on search and venue pages
- [ ] Full-text search returns expected venues/spaces/packs

---

## Related files

- Schema: `supabase/migrations/001_initial_schema.sql`
- Environment template: `.env.example`
