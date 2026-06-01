import { connectOld, connectNew } from "./lib.mjs";

async function main() {
  const oldDb = await connectOld();
  const newDb = await connectNew();
  console.log("Connected to both databases\n");

  // Prevent any single statement from hanging the whole import.
  await newDb.query("SET statement_timeout = '15s'");

  // Make the profile-creation trigger idempotent for re-runs.
  await newDb.query(`
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
    BEGIN
      INSERT INTO public.profiles (id, name, created_at)
      VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.raw_user_meta_data ->> 'full_name', ''),
        now()
      )
      ON CONFLICT (id) DO NOTHING;
      RETURN NEW;
    END; $$;
  `);

  const { rows } = await oldDb.query(`
    SELECT DISTINCT ON (lower(a.username))
      a.id,
      a.username AS email,
      a.password,
      a.created_at,
      u.name,
      u.roles,
      u.kind,
      u.date_of_birth
    FROM auth.users a
    LEFT JOIN users.users u ON u.id = a.id
    WHERE a.username IS NOT NULL AND a.username <> '' AND a.deleted_at IS NULL
    ORDER BY lower(a.username), a.created_at ASC
  `);
  console.log(`Source users (deduped by email): ${rows.length}`);

  let done = 0;
  let skipped = 0;
  const importedIds = [];

  for (const u of rows) {
    const meta = {
      name: u.name ?? "",
      roles: u.roles ?? ["customer"],
      kind: u.kind ?? "",
      date_of_birth: u.date_of_birth ?? null,
    };
    try {
      await newDb.query("BEGIN");

      const ins = await newDb.query(
        `INSERT INTO auth.users (
           instance_id, id, aud, role, email, encrypted_password,
           email_confirmed_at, created_at, updated_at,
           raw_app_meta_data, raw_user_meta_data
         ) VALUES (
           '00000000-0000-0000-0000-000000000000', $1, 'authenticated', 'authenticated',
           lower($2), $3, COALESCE($4, now()), COALESCE($4, now()), now(),
           '{"provider":"email","providers":["email"]}'::jsonb, $5::jsonb
         )
         ON CONFLICT (id) DO NOTHING`,
        [u.id, u.email, u.password, u.created_at, JSON.stringify(meta)],
      );

      if (ins.rowCount > 0) {
        await newDb.query(
          `INSERT INTO auth.identities (
             provider_id, user_id, identity_data, provider, created_at, updated_at
           ) VALUES ($1::text, $2::uuid, $3::jsonb, 'email', COALESCE($4, now()), now())
           ON CONFLICT (provider, provider_id) DO NOTHING`,
          [
            u.id,
            u.id,
            JSON.stringify({ sub: u.id, email: u.email.toLowerCase() }),
            u.created_at,
          ],
        );
      }

      await newDb.query(
        `INSERT INTO public.profiles (id, name, roles, kind, date_of_birth, created_at)
         VALUES ($1, $2, $3, $4, $5, COALESCE($6, now()))
         ON CONFLICT (id) DO UPDATE
           SET name = EXCLUDED.name,
               roles = EXCLUDED.roles,
               kind = EXCLUDED.kind,
               date_of_birth = EXCLUDED.date_of_birth`,
        [u.id, meta.name, meta.roles, meta.kind, meta.date_of_birth, u.created_at],
      );

      await newDb.query("COMMIT");
      importedIds.push(u.id);
      done += 1;
    } catch (e) {
      await newDb.query("ROLLBACK");
      skipped += 1;
      if (skipped <= 10) {
        console.log(`\n  skip ${u.email}: ${e.message}`);
      }
    }
    if ((done + skipped) % 100 === 0) {
      console.log(`  progress: ${done + skipped}/${rows.length} (imported ${done}, skipped ${skipped})`);
    }
  }

  console.log(`\nUsers imported: ${done}, skipped: ${skipped}`);

  const cnt = await newDb.query(`SELECT count(*)::int n FROM auth.users`);
  const pcnt = await newDb.query(`SELECT count(*)::int n FROM public.profiles`);
  console.log(`auth.users total now: ${cnt.rows[0].n}`);
  console.log(`public.profiles total now: ${pcnt.rows[0].n}`);

  await oldDb.end();
  await newDb.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
