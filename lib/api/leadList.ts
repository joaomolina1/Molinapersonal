import type { ApiContext } from "@lib/api/context";
import type { createAdminClient } from "@lib/db";

export type LeadListQuery = {
  q: string;
  assigned: "all" | "me";
};

export function parseLeadListQuery(ctx: ApiContext): LeadListQuery {
  const q = (ctx.query.get("q") ?? "").trim();
  const assigned =
    ctx.query.get("assigned") === "me" ? "me" : "all";
  return { q, assigned };
}

export function parseAssignedAdminIds(
  body: Record<string, unknown>,
): string[] | undefined | null {
  if (body.assignedAdminIds === undefined) return undefined;
  if (!Array.isArray(body.assignedAdminIds)) return null;
  const ids = body.assignedAdminIds
    .map((id) => String(id).trim())
    .filter(Boolean);
  return [...new Set(ids)];
}

export function matchesLeadSearch(
  row: Record<string, unknown>,
  q: string,
  kind: "quote" | "contact",
): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  const fields: string[] = [
    String(row.name ?? ""),
    String(row.email ?? ""),
    String(row.company_name ?? ""),
    String(row.area ?? ""),
    String(row.country ?? ""),
  ];

  fields.push(String(row.id ?? ""));

  if (kind === "quote") {
    fields.push(String(row.event_kind ?? ""));
    fields.push(String(row.notes ?? ""));
  } else {
    fields.push(String(row.kind ?? ""));
    fields.push(String(row.message ?? ""));
    fields.push(String(row.venue_name ?? ""));
    fields.push(String(row.space_name ?? ""));
    fields.push(String(row.pack_name ?? ""));
    fields.push(String(row.venue_id ?? ""));
    fields.push(String(row.space_id ?? ""));
    fields.push(String(row.pack_id ?? ""));
  }

  if (fields.some((f) => f.toLowerCase().includes(needle))) {
    return true;
  }

  const digits = q.replace(/\D/g, "");
  if (digits && row.phone_number != null) {
    return String(row.phone_number).includes(digits);
  }

  return false;
}

export function filterLeadRows(
  rows: Record<string, unknown>[],
  query: LeadListQuery,
  userId: string | undefined,
  kind: "quote" | "contact",
): Record<string, unknown>[] {
  let list = rows;

  if (query.assigned === "me" && userId) {
    list = list.filter((row) => {
      const ids = row.assigned_admin_ids;
      return (
        Array.isArray(ids) &&
        ids.map(String).includes(userId)
      );
    });
  }

  if (query.q) {
    list = list.filter((row) => matchesLeadSearch(row, query.q, kind));
  }

  return list;
}

export async function validateAssignedAdminIds(
  admin: ReturnType<typeof createAdminClient>,
  ids: string[],
): Promise<boolean> {
  if (!ids.length) return true;
  const { data, error } = await admin
    .from("profiles")
    .select("id, roles")
    .in("id", ids);
  if (error || !data || data.length !== ids.length) return false;
  return data.every(
    (row) =>
      Array.isArray(row.roles) && (row.roles as string[]).includes("admin"),
  );
}
