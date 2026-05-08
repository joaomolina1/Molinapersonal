import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import PageHeader from "@/components/PageHeader";
import ChildSwitcher from "@/components/ChildSwitcher";
import Icon from "@/components/Icon";

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

function formatDayKey(d: Date) {
  return new Intl.DateTimeFormat("pt-PT", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(d);
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function dayLabel(d: Date) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (isSameDay(d, today)) return "Hoje";
  if (isSameDay(d, yesterday)) return "Ontem";
  return formatDayKey(d);
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ childId?: string; page?: string }>;
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
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  const [directFeeds, bottleFeeds] = await Promise.all([
    db.directFeed.findMany({
      where: { childId: selected.id },
      orderBy: { startAt: "desc" },
    }),
    db.bottleFeed.findMany({
      where: { childId: selected.id },
      orderBy: { fedAt: "desc" },
    }),
  ]);

  type Entry =
    | {
        kind: "direct";
        id: string;
        date: Date;
        durationSeconds: number;
        breastSide: string;
        notes: string | null;
      }
    | {
        kind: "bottle";
        id: string;
        date: Date;
        amountMl: number;
        milkType: string;
        notes: string | null;
      };

  const entries: Entry[] = [
    ...directFeeds.map((f) => ({
      kind: "direct" as const,
      id: f.id,
      date: f.startAt,
      durationSeconds: f.durationSeconds,
      breastSide: f.breastSide,
      notes: f.notes,
    })),
    ...bottleFeeds.map((f) => ({
      kind: "bottle" as const,
      id: f.id,
      date: f.fedAt,
      amountMl: f.amountMl,
      milkType: f.milkType,
      notes: f.notes,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  const total = entries.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paged = entries.slice(skip, skip + pageSize);

  // Group by day
  const groups: { label: string; items: Entry[] }[] = [];
  for (const entry of paged) {
    const last = groups[groups.length - 1];
    if (last && isSameDay(last.items[0].date, entry.date)) {
      last.items.push(entry);
    } else {
      groups.push({ label: dayLabel(entry.date), items: [entry] });
    }
  }

  return (
    <div className="flex flex-col gap-5 fade-up">
      <PageHeader
        eyebrow="Diário"
        title="Histórico"
        subtitle={`${total} ${total === 1 ? "registo" : "registos"} · ${selected.name}`}
        icon="history"
        accent="accent"
      />

      <ChildSwitcher
        basePath="/history"
        items={children}
        selectedId={selected.id}
      />

      {paged.length === 0 ? (
        <section className="card rounded-3xl p-10 text-center">
          <span className="grid place-items-center w-14 h-14 mx-auto rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)] mb-3">
            <Icon name="history" size={26} />
          </span>
          <p className="font-semibold">Sem registos ainda</p>
          <p className="text-sm text-[var(--muted)] mt-1">
            Começa por registar uma mamada ou biberão.
          </p>
          <div className="mt-5 flex flex-col sm:flex-row gap-2 justify-center">
            <Link href="/feeds" className="btn btn-primary">
              <Icon name="drop" size={16} /> Registar mamada
            </Link>
            <Link href="/bottle" className="btn btn-bottle">
              <Icon name="bottle" size={16} /> Registar biberão
            </Link>
          </div>
        </section>
      ) : (
        <div className="flex flex-col gap-5">
          {groups.map((g) => (
            <section key={g.label} className="card rounded-3xl p-5 sm:p-6">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)] mb-3">
                {g.label}
              </h2>
              <ul className="flex flex-col divide-y divide-[var(--border)]">
                {g.items.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <span
                      className={`grid place-items-center w-10 h-10 rounded-xl shrink-0 mt-0.5 ${
                        entry.kind === "direct"
                          ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                          : "bg-[var(--bottle-soft)] text-[var(--bottle)]"
                      }`}
                    >
                      <Icon
                        name={entry.kind === "direct" ? "drop" : "bottle"}
                        size={18}
                      />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`chip ${
                            entry.kind === "direct"
                              ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                              : "bg-[var(--bottle-soft)] text-[var(--bottle)]"
                          }`}
                        >
                          {entry.kind === "direct" ? "Mama" : "Biberão"}
                        </span>
                        <p className="font-semibold tabular-nums">
                          {entry.kind === "direct"
                            ? `${Math.floor(entry.durationSeconds / 60)}m ${entry.durationSeconds % 60}s`
                            : `${entry.amountMl} ml`}
                        </p>
                        <span className="text-xs text-[var(--muted)]">
                          ·{" "}
                          {entry.kind === "direct"
                            ? SIDE_LABELS[entry.breastSide] ?? "—"
                            : MILK_LABELS[entry.milkType] ?? entry.milkType}
                        </span>
                      </div>
                      {entry.notes ? (
                        <p className="text-xs text-[var(--muted)] mt-1 line-clamp-2">
                          {entry.notes}
                        </p>
                      ) : null}
                    </div>
                    <p className="text-xs text-[var(--muted)] whitespace-nowrap tabular-nums">
                      {new Date(entry.date).toLocaleString("pt-PT", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <div className="flex items-center justify-between gap-2">
          {page > 1 ? (
            <Link
              href={`/history?childId=${selected.id}&page=${page - 1}`}
              className="btn btn-ghost"
            >
              <Icon name="left" size={16} /> Anterior
            </Link>
          ) : (
            <span />
          )}
          <span className="text-xs font-semibold text-[var(--muted)] tabular-nums">
            {page} / {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={`/history?childId=${selected.id}&page=${page + 1}`}
              className="btn btn-ghost"
            >
              Seguinte <Icon name="right" size={16} />
            </Link>
          ) : (
            <span />
          )}
        </div>
      ) : null}
    </div>
  );
}
