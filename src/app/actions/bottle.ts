"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function createBottleFeedAction(formData: FormData) {
  const user = await requireUser();

  const childId = formData.get("childId");
  const amountMl = formData.get("amountMl");
  const milkType = formData.get("milkType");
  const fedAt = formData.get("fedAt");
  const notes = formData.get("notes");

  if (
    typeof childId !== "string" ||
    typeof amountMl !== "string" ||
    typeof milkType !== "string"
  ) {
    throw new Error("Dados inválidos.");
  }

  const validMilkTypes = ["BREAST_MILK", "SUPPLEMENT", "AR"] as const;
  const type = validMilkTypes.includes(milkType as never)
    ? (milkType as "BREAST_MILK" | "SUPPLEMENT" | "AR")
    : "BREAST_MILK";

  const amount = parseInt(amountMl, 10);
  if (isNaN(amount) || amount <= 0) throw new Error("Volume inválido.");

  await db.bottleFeed.create({
    data: {
      userId: user.id,
      childId,
      fedAt: fedAt && typeof fedAt === "string" && fedAt ? new Date(fedAt) : new Date(),
      amountMl: amount,
      milkType: type,
      notes: typeof notes === "string" && notes.trim() ? notes.trim() : null,
    },
  });

  revalidatePath("/bottle");
  revalidatePath("/history");
}
