import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import BottleForm from "@/components/BottleForm";
import PageHeader from "@/components/PageHeader";
import ChildSwitcher from "@/components/ChildSwitcher";
import EmptyState from "@/components/EmptyState";
import Icon from "@/components/Icon";

const MILK_LABELS: Record<string, string> = {
  BREAST_MILK: "Leite materno",
  SUPPLEMENT: "Suplemento",
  AR: "AR",
};

export default async function BottlePage({
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

  const recentFeeds = await db.bottleFeed.findMany({
    where: { childId: selected.id },
    orderBy: { fedAt: "desc" },
    take: 10,
  });

  return (
    <div className="flex flex-col gap-5 fade-up">
      <PageHeader
        eyebrow="Registo"
        title="Biberão"
        subtitle="Volume, tipo de leite e hora."
        icon="bottle"
        accent="bottle"
      />

      <ChildSwitcher
        basePath="/bottle"
        items={children}
        selectedId={selected.id}
      />

      <section className="card rounded-3xl p-5 sm:p-7">
        <BottleForm childId={selected.id} childName={selected.name} />
      </section>

      <section className="card rounded-3xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
            Últimos biberões
          </h2>
          {recentFeeds.length > 0 ? (
            <Link
              href="/history"
              className="text-xs font-semibold text-[var(--bottle)] hover:underline"
            >
              Ver tudo
            </Link>
          ) : null}
        </div>
        {recentFeeds.length === 0 ? (
          <EmptyState
            icon="bottle"
            tone="bottle"
            title="Ainda sem biberões"
            description="Regista volume e tipo de leite no formulário acima."
          />
        ) : (
          <ul className="flex flex-col divide-y divide-[var(--border)]">
            {recentFeeds.map((f) => (
              <li
                key={f.id}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <span className="grid place-items-center w-10 h-10 rounded-xl bg-[var(--bottle-soft)] text-[var(--bottle)] shrink-0">
                  <Icon name="bottle" size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold tabular-nums">{f.amountMl} ml</p>
                  <p className="text-xs text-[var(--muted)]">
                    {MILK_LABELS[f.milkType] ?? f.milkType}
                  </p>
                </div>
                <p className="text-xs text-[var(--muted)] whitespace-nowrap">
                  {new Date(f.fedAt).toLocaleString("pt-PT", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
