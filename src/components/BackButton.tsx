"use client";

import { useRouter } from "next/navigation";
import Icon from "./Icon";

export default function BackButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="md:hidden inline-flex items-center gap-1 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition mb-2"
      aria-label="Voltar"
    >
      <Icon name="back" size={18} />
      <span>Voltar</span>
    </button>
  );
}
