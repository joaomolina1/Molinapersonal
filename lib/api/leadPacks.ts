import type { createAdminClient } from "@lib/db";
import { leadPackExtrasForDb, parseLeadPackExtrasBody } from "@lib/api/leadPricing";

export const MAX_LEAD_PACKS = 5;

export const LEAD_PACK_STATUSES = ["suggested", "won"] as const;

const LEAD_PACK_PACKS_JOIN =
  "packs(id, name, reference, packs_spaces(spaces(id, name, venues(id, name))))";

export function leadPackSelect(parentKey: "quote_id" | "contact_id") {
  return `id, ${parentKey}, pack_id, created_at, created_by, status, extra_ids, extra_params, ${LEAD_PACK_PACKS_JOIN}`;
}

export function isLeadPackStatus(value: unknown): value is "suggested" | "won" {
  return (
    typeof value === "string" &&
    (LEAD_PACK_STATUSES as readonly string[]).includes(value)
  );
}

export function isLeadPackLimitError(error: {
  code?: string;
  message?: string;
}): boolean {
  return (
    error.code === "23514" ||
    (error.message?.includes("quote_packs_limit_exceeded") ?? false) ||
    (error.message?.includes("contact_packs_limit_exceeded") ?? false)
  );
}

export function buildLeadPackUpdate(
  body: Record<string, unknown>,
): Record<string, unknown> | null {
  const update: Record<string, unknown> = {};
  if (body.status !== undefined) {
    if (!isLeadPackStatus(body.status)) return null;
    update.status = body.status;
  }
  if (body.extraIDs !== undefined || body.extraParams !== undefined) {
    const parsed = parseLeadPackExtrasBody(body);
    Object.assign(update, leadPackExtrasForDb(parsed.extraIDs, parsed.extraParams));
  }
  if (Object.keys(update).length === 0) return null;
  return update;
}

type LeadPackTable = "quote_packs" | "contact_packs";

export async function insertLeadPack(
  admin: ReturnType<typeof createAdminClient>,
  options: {
    table: LeadPackTable;
    parentKey: "quote_id" | "contact_id";
    parentId: string;
    packId: string;
    createdBy: string | null;
    body: Record<string, unknown>;
  },
) {
  const { extraIDs, extraParams } = parseLeadPackExtrasBody(options.body);

  const { count, error: countError } = await admin
    .from(options.table)
    .select("id", { count: "exact", head: true })
    .eq(options.parentKey, options.parentId);
  if (countError) return { error: countError, data: null };
  if ((count ?? 0) >= MAX_LEAD_PACKS) {
    return {
      error: {
        code: "limit",
        message: `Um pedido pode ter no máximo ${MAX_LEAD_PACKS} packs associados`,
      },
      data: null,
    };
  }

  const { data: pack } = await admin
    .from("packs")
    .select("id")
    .eq("id", options.packId)
    .is("deleted_at", null)
    .maybeSingle();
  if (!pack) return { error: { code: "404" }, data: null };

  const insertRow: Record<string, unknown> = {
    [options.parentKey]: options.parentId,
    pack_id: options.packId,
    created_by: options.createdBy,
    status: "suggested",
    ...leadPackExtrasForDb(extraIDs, extraParams),
  };

  const { data, error } = await admin
    .from(options.table)
    .insert(insertRow)
    .select(leadPackSelect(options.parentKey))
    .single();

  return { error, data };
}

export async function patchLeadPack(
  admin: ReturnType<typeof createAdminClient>,
  options: {
    table: LeadPackTable;
    parentKey: "quote_id" | "contact_id";
    parentId: string;
    packId: string;
    body: Record<string, unknown>;
  },
) {
  const update = buildLeadPackUpdate(options.body);
  if (!update) return { error: { code: "400" }, data: null };

  const { data, error } = await admin
    .from(options.table)
    .update(update)
    .eq(options.parentKey, options.parentId)
    .eq("pack_id", options.packId)
    .select(leadPackSelect(options.parentKey))
    .maybeSingle();

  return { error, data };
}
