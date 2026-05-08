"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import Icon, { type IconName } from "./Icon";

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: "/dashboard", label: "Início", icon: "home" },
  { href: "/feeds", label: "Mama", icon: "drop" },
  { href: "/bottle", label: "Biberão", icon: "bottle" },
  { href: "/history", label: "Histórico", icon: "history" },
  { href: "/stats", label: "Estatísticas", icon: "stats" },
  { href: "/children", label: "Filhos", icon: "baby" },
];

interface Props {
  userEmail?: string | null;
}

export default function TopBar({ userEmail }: Props) {
  const pathname = usePathname() ?? "";

  return (
    <header className="sticky top-0 z-20 px-3 pt-3 sm:px-6 sm:pt-4">
      <div className="mx-auto max-w-5xl card rounded-2xl px-3 sm:px-4 py-2.5 flex items-center gap-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 shrink-0 group"
          aria-label="Início"
        >
          <span className="grid place-items-center w-9 h-9 rounded-2xl bg-gradient-to-br from-[#f06292] to-[#e94e77] text-white shadow-sm group-hover:scale-105 transition">
            <Icon name="drop" size={18} />
          </span>
          <span className="hidden sm:flex flex-col leading-tight">
            <span className="text-[15px] font-bold tracking-tight">Mama</span>
            <span className="text-[11px] text-[var(--muted)]">Diário</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 ml-2">
          {NAV.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition ${
                  active
                    ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-white/60"
                }`}
              >
                <Icon name={item.icon} size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {userEmail ? (
            <span className="hidden lg:inline text-xs text-[var(--muted)] max-w-[180px] truncate">
              {userEmail}
            </span>
          ) : null}
          <Link
            href="/children"
            className="md:hidden grid place-items-center w-9 h-9 rounded-xl bg-white/70 border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
            aria-label="Filhos"
          >
            <Icon name="baby" size={18} />
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="grid place-items-center w-9 h-9 rounded-xl bg-white/70 border border-[var(--border)] text-[var(--muted)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition"
              aria-label="Terminar sessão"
              title="Terminar sessão"
            >
              <Icon name="logout" size={18} />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
