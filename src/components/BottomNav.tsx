"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon, { type IconName } from "./Icon";

const ITEMS: { href: string; label: string; icon: IconName }[] = [
  { href: "/dashboard", label: "Início", icon: "home" },
  { href: "/feeds", label: "Mama", icon: "drop" },
  { href: "/bottle", label: "Biberão", icon: "bottle" },
  { href: "/history", label: "Histórico", icon: "history" },
  { href: "/stats", label: "Stats", icon: "stats" },
];

export default function BottomNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav
      aria-label="Navegação principal"
      className="md:hidden fixed bottom-0 inset-x-0 z-30 px-3 pb-safe"
    >
      <div className="mx-auto max-w-md card rounded-3xl flex items-stretch justify-between px-2 py-1.5">
        {ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 rounded-2xl transition ${
                active
                  ? "text-[var(--primary)] bg-[var(--primary-soft)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              <Icon name={item.icon} size={22} />
              <span className="text-[10px] font-semibold tracking-wide">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
