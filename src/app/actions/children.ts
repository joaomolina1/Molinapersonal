"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function createChildAction(formData: FormData) {
  const user = await requireUser();

  const name = getString(formData, "name");
  const birthDateRaw = getString(formData, "birthDate");
  const notes = getString(formData, "notes");

  if (!name) {
    redirect("/children?error=Nome+e+obrigatorio");
  }

  let birthDate: Date | null = null;

  if (birthDateRaw) {
    const parsedDate = new Date(birthDateRaw);

    if (Number.isNaN(parsedDate.getTime())) {
      redirect("/children?error=Data+de+nascimento+invalida");
    }

    birthDate = parsedDate;
  }

  await db.child.create({
    data: {
      userId: user.id,
      name,
      birthDate,
      notes: notes || null,
    },
  });

  redirect("/children?message=Filho+adicionado+com+sucesso");
}
