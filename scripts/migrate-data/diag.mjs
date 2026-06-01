import { connectNew } from "./lib.mjs";

const db = await connectNew();
console.log("connected");

const id = "00000000-1111-2222-3333-444444444444";
const t0 = Date.now();
try {
  await db.query("BEGIN");
  const r = await db.query(
    `INSERT INTO auth.users (
       instance_id, id, aud, role, email, encrypted_password,
       email_confirmed_at, created_at, updated_at,
       raw_app_meta_data, raw_user_meta_data
     ) VALUES (
       '00000000-0000-0000-0000-000000000000', $1, 'authenticated', 'authenticated',
       'diagtest@example.com', '$2a$10$abcdefghijklmnopqrstuv', now(), now(), now(),
       '{"provider":"email","providers":["email"]}'::jsonb, '{"name":"Diag"}'::jsonb
     )
     ON CONFLICT (id) DO NOTHING`,
    [id],
  );
  console.log(`insert auth.users rowCount=${r.rowCount} in ${Date.now() - t0}ms`);

  const p = await db.query(`SELECT count(*)::int n FROM public.profiles WHERE id=$1`, [id]);
  console.log(`profiles created by trigger: ${p.rows[0].n}`);

  await db.query("ROLLBACK");
  console.log("rolled back (no permanent change)");
} catch (e) {
  await db.query("ROLLBACK");
  console.log(`ERROR after ${Date.now() - t0}ms: ${e.message}`);
}
await db.end();
