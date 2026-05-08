import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import Icon, { type IconName } from "@/components/Icon";

const SIDE_LABELS: Record<string, string> = {
  LEFT: "Esquerda",
  RIGHT: "Direita",
  BOTH: "Ambos",
  UNKNOWN: "—",
};

const MILK_LABELS: Record<string, string> = {
  BREAST_MILK: "Leite materno",
  SUPPLEMENT: "Suplemento",
  AR: "AR",
};

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function timeAgo(date: Date) {
  const diff = Math.max(0, Date.now() - date.getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `há ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  return `há ${days}d`;
}

export default async function DashboardPage() {
  const user = await requireUser();

  const children = await db.child.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });

  const todayStart = startOfDay(new Date());

  const [directToday, bottleToday, lastDirect, lastBottle] = children.length
    ? await Promise.all([
        db.directFeed.findMany({
          where: { userId: user.id, startAt: { gte: todayStart } },
        }),
        db.bottleFeed.findMany({
          where: { userId: user.id, fedAt: { gte: todayStart } },
        }),
        db.directFeed.findFirst({
          where: { userId: user.id },
          orderBy: { startAt: "desc" },
        }),
        db.bottleFeed.findFirst({
          where: { userId: user.id },
          orderBy: { fedAt: "desc" },
        }),
      ])
    : [[], [], null, null];

  const todayCount = directToday.length + bottleToday.length;
  const todayMins = Math.round(
    directToday.reduce((s, f) => s + f.durationSeconds, 0) / 60,
  );
  const todayMl = bottleToday.reduce((s, f) => s + f.amountMl, 0);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 6) return "Boa madrugada";
    if (h < 12) return "Bom dia";
    if (h < 19) return "Boa tarde";
    return "Boa noite";
  })();

  const displayName =
    (user.user_metadata as { display_name?: string } | null)?.display_name?.trim() ||
    user.email?.split("@")[0] ||
    "";

  return (
    <div className="flex flex-col gap-5 fade-up">
      {/* Hero greeting card */}
      <section className="card rounded-3xl p-5 sm:p-7 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-gradient-to-br from-[#ffd9e4] to-[#e9e1ff] blur-2xl opacity-70" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            {greeting}
          </p>
          <h1 className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight">
            {displayName ? `Olá, ${displayName}` : "Olá!"}
          </h1>
          <p className="mt-1.5 text-sm text-[var(--muted)]">
            {children.length === 0
              ? "Vamos começar — adiciona o teu bebé."
              : todayCount > 0
                ? `${todayCount} ${todayCount === 1 ? "registo" : "registos"} hoje. Boa.`
                : "Ainda sem registos hoje. Pronta?"}
          </p>

          {children.length === 0 ? (
            <Link href="/children" className="btn btn-primary mt-5">
              <Icon name="plus" size={16} /> Adicionar bebé
            </Link>
          ) : (
            <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
              <StatPill value={todayCount} label="hoje" tone="primary" />
              <StatPill value={`${todayMins}m`} label="ao peito" tone="accent" />
              <StatPill value={`${todayMl}ml`} label="biberão" tone="bottle" />
            </div>
          )}
        </div>
      </section>

      {/* Quick actions */}
      {children.length > 0 ? (
        <section className="grid grid-cols-2 gap-3">
          <ActionCard
            href="/feeds"
            title="Mamada"
            subtitle="Cronómetro ao peito"
            icon="drop"
            tone="primary"
          />
          <ActionCard
            href="/bottle"
            title="Biberão"
            subtitle="Volume e tipo"
            icon="bottle"
            tone="bottle"
          />
          <ActionCard
            href="/history"
            title="Histórico"
            subtitle="Tudo num sítio"
            icon="history"
            tone="muted"
          />
          <ActionCard
            href="/stats"
            title="Estatísticas"
            subtitle="Hoje e últimos 7 dias"
            icon="stats"
            tone="accent"
          />
        </section>
      ) : null}

      {/* Last events */}
      {children.length > 0 && (lastDirect || lastBottle) ? (
        <section className="card rounded-3xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
              Últimos registos
            </h2>
            <Link
              href="/history"
              className="text-xs font-semibold text-[var(--primary)] hover:underline"
            >
              Ver tudo
            </Link>
          </div>
          <ul className="flex flex-col divide-y divide-[var(--border)]">
            {lastDirect ? (
              <LastItem
                kind="direct"
                title={`${Math.floor(lastDirect.durationSeconds / 60)}m ${lastDirect.durationSeconds % 60}s`}
                detail={SIDE_LABELS[lastDirect.breastSide] ?? "—"}
                date={lastDirect.startAt}
              />
            ) : null}
            {lastBottle ? (
              <LastItem
                kind="bottle"
                title={`${lastBottle.amountMl} ml`}
                detail={MILK_LABELS[lastBottle.milkType] ?? lastBottle.milkType}
                date={lastBottle.fedAt}
              />
            ) : null}
          </ul>
        </section>
      ) : null}

      {/* Children chips */}
      {children.length > 0 ? (
        <section className="card rounded-3xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
              {children.length === 1 ? "Bebé" : "Bebés"}
            </h2>
            <Link
              href="/children"
              className="text-xs font-semibold text-[var(--primary)] hover:underline inline-flex items-center gap-1"
            >
              <Icon name="plus" size={14} /> Gerir
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {children.map((c) => (
              <span
                key={c.id}
                className="chip bg-white/70 border border-[var(--border)] text-[var(--foreground)]"
              >
                <Icon name="baby" size={12} />
                {c.name}
              </span>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function StatPill({
  value,
  label,
  tone,
}: {
  value: number | string;
  label: string;
  tone: "primary" | "accent" | "bottle";
}) {
  const toneCls =
    tone === "primary"
      ? "from-[#fde7ec] to-white text-[var(--primary)]"
      : tone === "bottle"
        ? "from-[#e6efff] to-white text-[var(--bottle)]"
        : "from-[#efeaff] to-white text-[var(--accent)]";
  return (
    <div className={`rounded-2xl bg-gradient-to-b ${toneCls} border border-white/60 p-3 text-center`}>
      <p className="text-xl sm:text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-[10px] uppercase tracking-wider opacity-80 mt-0.5">
        {label}
      </p>
    </div>
  );
}

function ActionCard({
  href,
  title,
  subtitle,
  icon,
  tone,
}: {
  href: string;
  title: string;
  subtitle: string;
  icon: IconName;
  tone: "primary" | "bottle" | "accent" | "muted";
}) {
  const grad: Record<string, string> = {
    primary: "from-[#f06292] to-[#e94e77]",
    bottle: "from-[#6aa1ff] to-[#4f8cff]",
    accent: "from-[#8b6dff] to-[#7c5cff]",
    muted: "from-slate-400 to-slate-500",
  };
  return (
    <Link
      href={href}
      className="card rounded-3xl p-4 sm:p-5 hover:translate-y-[-1px] transition group"
    >
      <span
        className={`grid place-items-center w-11 h-11 rounded-2xl text-white bg-gradient-to-br ${grad[tone]} shadow-sm group-hover:scale-105 transition`}
      >
        <Icon name={icon} size={22} />
      </span>
      <p className="mt-3 font-semibold tracking-tight">{title}</p>
      <p className="text-xs text-[var(--muted)] mt-0.5">{subtitle}</p>
    </Link>
  );
}

function LastItem({
  kind,
  title,
  detail,
  date,
}: {
  kind: "direct" | "bottle";
  title: string;
  detail: string;
  date: Date;
}) {
  return (
    <li className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
      <span
        className={`grid place-items-center w-10 h-10 rounded-xl shrink-0 ${
          kind === "direct"
            ? "bg-[var(--primary-soft)] text-[var(--primary)]"
            : "bg-[var(--bottle-soft)] text-[var(--bottle)]"
        }`}
      >
        <Icon name={kind === "direct" ? "drop" : "bottle"} size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-sm">{title}</p>
        <p className="text-xs text-[var(--muted)]">{detail}</p>
      </div>
      <span className="text-xs text-[var(--muted)] whitespace-nowrap">
        {timeAgo(date)}
      </span>
    </li>
  );
}
