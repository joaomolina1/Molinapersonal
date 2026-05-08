import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import PageHeader from "@/components/PageHeader";
import ChildSwitcher from "@/components/ChildSwitcher";
import Icon from "@/components/Icon";

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

const SIDE_LABEL: Record<string, string> = {
  LEFT: "Esquerda",
  RIGHT: "Direita",
  BOTH: "Ambos",
  UNKNOWN: "—",
};

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ childId?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;

  const children = await db.child.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
  });

  if (children.length === 0) {
    redirect("/children");
  }

  const selectedId = params.childId ?? children[0].id;
  const selected = children.find((c) => c.id === selectedId) ?? children[0];

  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 6);

  const [directAll, bottleAll, directToday, bottleToday] = await Promise.all([
    db.directFeed.findMany({
      where: { childId: selected.id },
      orderBy: { startAt: "desc" },
    }),
    db.bottleFeed.findMany({
      where: { childId: selected.id },
      orderBy: { fedAt: "desc" },
    }),
    db.directFeed.findMany({
      where: { childId: selected.id, startAt: { gte: todayStart } },
    }),
    db.bottleFeed.findMany({
      where: { childId: selected.id, fedAt: { gte: todayStart } },
    }),
  ]);

  const todayDirectMins =
    directToday.reduce((s, f) => s + f.durationSeconds, 0) / 60;
  const todayBottleMl = bottleToday.reduce((s, f) => s + f.amountMl, 0);
  const todayTotal = directToday.length + bottleToday.length;

  const avgDuration =
    directAll.length > 0
      ? directAll.reduce((s, f) => s + f.durationSeconds, 0) /
        directAll.length /
        60
      : 0;
  const avgBottle =
    bottleAll.length > 0
      ? bottleAll.reduce((s, f) => s + f.amountMl, 0) / bottleAll.length
      : 0;

  const lastDirect = directAll[0];

  const days: { label: string; direct: number; bottle: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(todayStart);
    d.setDate(d.getDate() - i);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    days.push({
      label: d
        .toLocaleDateString("pt-PT", { weekday: "short" })
        .replace(".", ""),
      direct: directAll.filter((f) => f.startAt >= d && f.startAt < next).length,
      bottle: bottleAll.filter((f) => f.fedAt >= d && f.fedAt < next).length,
    });
  }

  const maxCount = Math.max(1, ...days.map((d) => d.direct + d.bottle));

  return (
    <div className="flex flex-col gap-5 fade-up">
      <PageHeader
        eyebrow="Insights"
        title="Estatísticas"
        subtitle={selected.name}
        icon="stats"
        accent="accent"
      />

      <ChildSwitcher
        basePath="/stats"
        items={children}
        selectedId={selected.id}
      />

      {/* Today */}
      <section className="grid grid-cols-3 gap-3">
        <BigStat value={todayTotal} label="Hoje" tone="accent" />
        <BigStat
          value={`${todayDirectMins.toFixed(0)}m`}
          label="Ao peito"
          tone="primary"
        />
        <BigStat value={`${todayBottleMl}ml`} label="Biberão" tone="bottle" />
      </section>

      {/* All-time */}
      <section className="card rounded-3xl p-5 sm:p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">
          Geral
        </h2>
        <ul className="flex flex-col divide-y divide-[var(--border)]">
          <Row label="Total mamadas ao peito" value={String(directAll.length)} />
          <Row
            label="Duração média (peito)"
            value={`${avgDuration.toFixed(1)} min`}
          />
          <Row label="Total biberões" value={String(bottleAll.length)} />
          <Row
            label="Volume médio (biberão)"
            value={`${avgBottle.toFixed(0)} ml`}
          />
          {lastDirect ? (
            <Row
              label="Último lado usado"
              value={SIDE_LABEL[lastDirect.breastSide] ?? "—"}
            />
          ) : null}
        </ul>
      </section>

      {/* 7-day chart */}
      <section className="card rounded-3xl p-5 sm:p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)] mb-4">
          Últimos 7 dias
        </h2>
        <div className="flex items-end gap-1.5 sm:gap-2 h-36">
          {days.map((d, i) => {
            const total = d.direct + d.bottle;
            const directH = Math.round((d.direct / maxCount) * 100);
            const bottleH = Math.round((d.bottle / maxCount) * 100);
            return (
              <div
                key={i}
                className="flex flex-col items-center flex-1 gap-1.5 h-full"
              >
                <span className="text-[11px] font-semibold tabular-nums text-[var(--muted)] h-4">
                  {total > 0 ? total : ""}
                </span>
                <div className="w-full flex-1 flex flex-col-reverse rounded-xl overflow-hidden bg-[var(--surface-soft)] border border-[var(--border)] min-h-[12px]">
                  {d.direct > 0 ? (
                    <div
                      className="w-full bg-gradient-to-t from-[#e94e77] to-[#f06292]"
                      style={{ height: `${directH}%` }}
                    />
                  ) : null}
                  {d.bottle > 0 ? (
                    <div
                      className="w-full bg-gradient-to-t from-[#4f8cff] to-[#6aa1ff]"
                      style={{ height: `${bottleH}%` }}
                    />
                  ) : null}
                </div>
                <span className="text-[11px] text-[var(--muted)] capitalize leading-none">
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex gap-4 mt-4 justify-center text-xs text-[var(--muted)]">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-gradient-to-br from-[#f06292] to-[#e94e77] inline-block" />
            <Icon name="drop" size={12} /> Mama
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-gradient-to-br from-[#6aa1ff] to-[#4f8cff] inline-block" />
            <Icon name="bottle" size={12} /> Biberão
          </span>
        </div>
      </section>
    </div>
  );
}

function BigStat({
  value,
  label,
  tone,
}: {
  value: number | string;
  label: string;
  tone: "primary" | "bottle" | "accent";
}) {
  const map = {
    primary: "text-[var(--primary)] from-[#fde7ec]",
    bottle: "text-[var(--bottle)] from-[#e6efff]",
    accent: "text-[var(--accent)] from-[#efeaff]",
  } as const;
  return (
    <div
      className={`card rounded-3xl p-4 text-center bg-gradient-to-b ${map[tone]} to-white`}
    >
      <p className={`text-2xl sm:text-3xl font-bold tabular-nums ${map[tone].split(" ")[0]}`}>
        {value}
      </p>
      <p className="text-[11px] uppercase tracking-wider text-[var(--muted)] mt-0.5 font-semibold">
        {label}
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0 text-sm">
      <span className="text-[var(--muted)]">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </li>
  );
}
