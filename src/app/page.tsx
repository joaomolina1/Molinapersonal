import Link from "next/link";
import Icon from "@/components/Icon";

export default function Home() {
  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-5 py-12 sm:px-8 overflow-hidden">
      <div
        className="hero-orb w-72 h-72 bg-[#ffc8d7]/50 -top-20 -left-20"
        aria-hidden
      />
      <div
        className="hero-orb w-64 h-64 bg-[#c4b5ff]/40 top-10 -right-16"
        aria-hidden
      />

      <div className="grid gap-10 md:grid-cols-[1.08fr_1fr] items-center relative">
        <div className="fade-up">
          <span className="chip bg-[var(--primary-soft)] text-[var(--primary)]">
            <Icon name="sparkle" size={14} />
            Diário de amamentação
          </span>
          <h1 className="font-display mt-5 text-4xl sm:text-[2.75rem] font-semibold tracking-tight leading-[1.08]">
            Mamadas e biberões,
            <span className="block text-gradient mt-1">registados em segundos.</span>
          </h1>
          <p className="mt-5 text-base sm:text-lg leading-7 text-[var(--muted)] max-w-lg">
            Um cronómetro simples, histórico claro e estatísticas honestas — feito
            para usar com uma mão, no telemóvel ou no computador.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link href="/register" className="btn btn-primary">
              Criar conta
              <Icon name="right" size={16} />
            </Link>
            <Link href="/login" className="btn btn-ghost">
              Já tenho conta
            </Link>
          </div>

          <ul className="mt-10 grid grid-cols-2 gap-3 max-w-md text-sm">
            <Feature icon="drop" label="Cronómetro ao peito" />
            <Feature icon="bottle" label="Registo de biberões" />
            <Feature icon="history" label="Histórico completo" />
            <Feature icon="stats" label="Estatísticas diárias" />
          </ul>
        </div>

        <div className="relative fade-up fade-up-delay-2">
          <div className="card card-hover rounded-[28px] p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="section-label">Em curso</p>
                <p className="mt-1 text-sm text-[var(--foreground)] font-semibold">
                  Maria · lado esquerdo
                </p>
              </div>
              <span className="chip bg-[var(--primary-soft)] text-[var(--primary)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
                Ao vivo
              </span>
            </div>
            <div className="mt-6 grid place-items-center">
              <div className="relative w-44 h-44 rounded-full bg-gradient-to-br from-[#fde8ee] via-white to-[#f0ebff] grid place-items-center timer-pulse">
                <div className="absolute inset-2 rounded-full border border-white/80" />
                <span className="relative font-mono text-4xl font-bold tabular-nums text-[var(--primary)]">
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
          <div
            className="hidden md:block absolute -z-10 -inset-6 rounded-[44px] bg-gradient-to-br from-[#ffc8d7]/40 via-transparent to-[#c4b5ff]/35 blur-3xl"
            aria-hidden
          />
        </div>
      </div>
    </main>
  );
}

function Feature({
  icon,
  label,
}: {
  icon: "drop" | "bottle" | "history" | "stats";
  label: string;
}) {
  return (
    <li className="flex items-center gap-2.5">
      <span className="grid place-items-center w-9 h-9 rounded-xl bg-white/80 border border-[var(--border)] text-[var(--primary)] shadow-sm">
        <Icon name={icon} size={16} />
      </span>
      <span className="font-medium text-[var(--foreground)]">{label}</span>
    </li>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-white/80 border border-[var(--border)] py-3 px-2 text-center">
      <p className="text-base font-bold tabular-nums">{value}</p>
      <p className="section-label mt-1 opacity-80">{label}</p>
    </div>
  );
}
