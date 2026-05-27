import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import FeedTimer from "@/components/FeedTimer";
import PageHeader from "@/components/PageHeader";
import ChildSwitcher from "@/components/ChildSwitcher";
import EmptyState from "@/components/EmptyState";
import Icon from "@/components/Icon";

const SIDE_LABELS: Record<string, string> = {
  LEFT: "Esquerda",
  RIGHT: "Direita",
  BOTH: "Ambos",
  UNKNOWN: "—",
};

export default async function FeedsPage({
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

  const recentFeeds = await db.directFeed.findMany({
    where: { childId: selected.id },
    orderBy: { startAt: "desc" },
    take: 10,
  });

  return (
    <div className="flex flex-col gap-5 fade-up">
      <PageHeader
        eyebrow="Cronómetro"
        title="Mamada"
        subtitle="Carrega em iniciar quando começares."
        icon="drop"
        accent="primary"
      />

      <ChildSwitcher
        basePath="/feeds"
        items={children}
        selectedId={selected.id}
      />

      <section className="card rounded-3xl p-6 sm:p-8">
        <FeedTimer childId={selected.id} childName={selected.name} />
      </section>

      <section className="card rounded-3xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
            Últimas mamadas
          </h2>
          {recentFeeds.length > 0 ? (
            <Link
              href="/history"
              className="text-xs font-semibold text-[var(--primary)] hover:underline"
            >
              Ver tudo
            </Link>
          ) : null}
        </div>
        {recentFeeds.length === 0 ? (
          <EmptyState
            icon="drop"
            tone="primary"
            title="Ainda sem mamadas"
            description="Usa o cronómetro acima para registar a primeira mamada."
          />
        ) : (
          <ul className="flex flex-col divide-y divide-[var(--border)]">
            {recentFeeds.map((f) => {
              const mins = Math.floor(f.durationSeconds / 60);
              const secs = f.durationSeconds % 60;
              return (
                <li
                  key={f.id}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <span className="grid place-items-center w-10 h-10 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] shrink-0">
                    <Icon name="drop" size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold tabular-nums">
                      {mins}m {secs}s
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {SIDE_LABELS[f.breastSide] ?? "—"}
                    </p>
                  </div>
                  <p className="text-xs text-[var(--muted)] whitespace-nowrap">
                    {new Date(f.startAt).toLocaleString("pt-PT", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
