"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function createDirectFeedAction(formData: FormData) {
  const user = await requireUser();

  const childId = formData.get("childId");
  const startAt = formData.get("startAt");
  const endAt = formData.get("endAt");
  const durationSeconds = formData.get("durationSeconds");
  const breastSide = formData.get("breastSide");
  const notes = formData.get("notes");

  if (
    typeof childId !== "string" ||
    typeof startAt !== "string" ||
    typeof endAt !== "string" ||
    typeof durationSeconds !== "string"
  ) {
    throw new Error("Dados inválidos.");
  }

  const side = (["LEFT", "RIGHT", "BOTH", "UNKNOWN"] as const).includes(
    breastSide as never
  )
    ? (breastSide as "LEFT" | "RIGHT" | "BOTH" | "UNKNOWN")
    : "UNKNOWN";

  await db.directFeed.create({
    data: {
      userId: user.id,
      childId,
      startAt: new Date(startAt),
      endAt: new Date(endAt),
      durationSeconds: parseInt(durationSeconds, 10),
      breastSide: side,
      isManual: formData.get("isManual") === "true",
      notes: typeof notes === "string" && notes.trim() ? notes.trim() : null,
    },
  });

  revalidatePath("/feeds");
}
