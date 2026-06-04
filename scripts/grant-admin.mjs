import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

function loadEnv() {
  const text = readFileSync(new URL("../.env", import.meta.url), "utf8");
  for (const line of text.split("\n")) {
    const m = line.match(/^([A-Z_]+)="(.*)"$/);
    if (m) process.env[m[1]] = m[2];
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const admin = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/grant-admin.mjs <email>");
  process.exit(1);
}

const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 });
const existing = list?.users?.find(
  (u) => u.email?.toLowerCase() === email.toLowerCase(),
);

let userId = existing?.id;

if (!userId) {
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { name: email.split("@")[0] },
  });
  if (error) {
    const created = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { name: email.split("@")[0] },
    });
    if (created.error) {
      console.error("create/invite failed:", created.error.message);
      process.exit(1);
    }
    userId = created.data.user.id;
    console.log("Created user:", email);
  } else {
    userId = data.user?.id;
    console.log("Invited user:", email);
  }
}

const { data: profile } = await admin
  .from("profiles")
  .select("roles")
  .eq("id", userId)
  .maybeSingle();

const current = Array.isArray(profile?.roles) ? profile.roles : [];
const roles = [...new Set([...current, "admin"])];

const { error: updateError } = await admin
  .from("profiles")
  .update({ roles })
  .eq("id", userId);

if (updateError) {
  console.error("profile update failed:", updateError.message);
  process.exit(1);
}

console.log("Admin granted:", email, "roles:", roles.join(", "));
