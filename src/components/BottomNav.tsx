"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon, { type IconName } from "./Icon";

const ITEMS: { href: string; label: string; icon: IconName }[] = [
  { href: "/dashboard", label: "Início", icon: "home" },
  { href: "/feeds", label: "Mama", icon: "drop" },
  { href: "/bottle", label: "Biberão", icon: "bottle" },
  { href: "/history", label: "Histórico", icon: "history" },
  { href: "/stats", label: "Dados", icon: "stats" },
];

export default function BottomNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav
      aria-label="Navegação principal"
      className="md:hidden fixed bottom-0 inset-x-0 z-30 px-3 pb-safe"
    >
      <div className="mx-auto max-w-md card rounded-[1.35rem] flex items-stretch justify-between px-1.5 py-1 shadow-[0_-4px_24px_-8px_rgba(28,21,36,0.08)]">
        {ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 rounded-xl transition-all duration-200 ${
                active
                  ? "text-[var(--primary)] bg-[var(--primary-soft)] shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              <Icon name={item.icon} size={active ? 24 : 22} />
              <span className="text-[10px] font-semibold tracking-wide leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
