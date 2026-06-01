import { connectNew } from "./lib.mjs";

const email = process.argv[2] ?? "jmolina@rinu.pt";

async function main() {
  const db = await connectNew();

  const user = await db.query(
    `SELECT id FROM auth.users WHERE lower(email) = lower($1)`,
    [email],
  );
  if (!user.rows[0]) {
    console.error(`User ${email} not found`);
    process.exit(1);
  }
  const id = user.rows[0].id;

  const upd = await db.query(
    `UPDATE public.profiles
     SET roles = ARRAY['customer','vendor','admin']::text[]
     WHERE id = $1`,
    [id],
  );
  console.log(`profiles rows updated: ${upd.rowCount}`);

  if (upd.rowCount === 0) {
    await db.query(
      `INSERT INTO public.profiles (id, name, roles, created_at)
       VALUES ($1, '', ARRAY['customer','vendor','admin']::text[], now())
       ON CONFLICT (id) DO UPDATE
         SET roles = ARRAY['customer','vendor','admin']::text[]`,
      [id],
    );
    console.log("profile inserted/updated via upsert");
  }

  // Keep auth metadata in sync so the session bridge sees the role too.
  await db.query(
    `UPDATE auth.users
     SET raw_user_meta_data =
       COALESCE(raw_user_meta_data, '{}'::jsonb)
       || jsonb_build_object('roles', '["customer","vendor","admin"]'::jsonb)
     WHERE id = $1`,
    [id],
  );

  const check = await db.query(
    `SELECT u.email, p.roles FROM auth.users u
     LEFT JOIN public.profiles p ON p.id = u.id WHERE u.id = $1`,
    [id],
  );
  console.log("Final state:", check.rows[0]);

  await db.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
