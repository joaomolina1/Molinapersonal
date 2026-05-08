import Link from "next/link";
import Icon from "@/components/Icon";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-5 py-12 sm:px-8">
      <div className="grid gap-8 md:grid-cols-[1.1fr_1fr] items-center">
        <div className="fade-up">
          <span className="chip bg-[var(--primary-soft)] text-[var(--primary)]">
            <Icon name="sparkle" size={14} />
            Diário de amamentação
          </span>
          <h1 className="mt-5 text-4xl sm:text-5xl font-bold tracking-tight leading-[1.05]">
            Mamadas e biberões,
            <span className="block bg-gradient-to-r from-[#e94e77] via-[#a06bff] to-[#4f8cff] bg-clip-text text-transparent">
              registados em segundos.
            </span>
          </h1>
          <p className="mt-5 text-base sm:text-lg leading-7 text-[var(--muted)] max-w-lg">
            Um cronómetro simples, histórico claro e estatísticas honestas — feito
            para usar com uma mão, no telemóvel ou no computador.
          </p>

          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <Link href="/register" className="btn btn-primary">
              Criar conta
              <Icon name="right" size={16} />
            </Link>
            <Link href="/login" className="btn btn-ghost">
              Já tenho conta
            </Link>
          </div>

          <ul className="mt-9 grid grid-cols-2 gap-3 max-w-md text-sm">
            <Feature icon="drop" label="Cronómetro ao peito" />
            <Feature icon="bottle" label="Registo de biberões" />
            <Feature icon="history" label="Histórico completo" />
            <Feature icon="stats" label="Estatísticas diárias" />
          </ul>
        </div>

        <div className="relative fade-up">
          <div className="card rounded-[28px] p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Em curso
                </p>
                <p className="mt-1 text-sm text-[var(--foreground)] font-semibold">
                  Maria · lado esquerdo
                </p>
              </div>
              <span className="chip bg-[var(--primary-soft)] text-[var(--primary)]">
                Ao vivo
              </span>
            </div>
            <div className="mt-6 grid place-items-center">
              <div className="relative w-44 h-44 rounded-full bg-gradient-to-br from-[#fde7ec] to-[#efeaff] grid place-items-center timer-pulse">
                <span className="font-mono text-4xl font-bold tabular-nums text-[var(--primary)]">
                  07:42
                </span>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-2">
              <Stat value="6" label="Hoje" />
              <Stat value="42m" label="Ao peito" />
              <Stat value="180ml" label="Biberão" />
            </div>
          </div>
          <div className="hidden md:block absolute -z-10 -inset-4 rounded-[40px] bg-gradient-to-br from-[#ffe4ec]/60 via-transparent to-[#e9e1ff]/60 blur-2xl" />
        </div>
      </div>
    </main>
  );
}

function Feature({ icon, label }: { icon: "drop" | "bottle" | "history" | "stats"; label: string }) {
  return (
    <li className="flex items-center gap-2.5 text-[var(--muted)]">
      <span className="grid place-items-center w-8 h-8 rounded-xl bg-white/70 border border-[var(--border)] text-[var(--primary)]">
        <Icon name={icon} size={16} />
      </span>
      <span className="font-medium text-[var(--foreground)]">{label}</span>
    </li>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-white/70 border border-[var(--border)] py-3 px-2 text-center">
      <p className="text-base font-bold tabular-nums">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-[var(--muted)] mt-0.5">
        {label}
      </p>
    </div>
  );
}
