import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { createChildAction } from "@/app/actions/children";
import PageHeader from "@/components/PageHeader";
import Icon from "@/components/Icon";

type ChildrenPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(value: string | string[] | undefined) {
  if (!value) return "";
  return Array.isArray(value) ? value[0] : value;
}

function formatDate(date: Date | null) {
  if (!date) return "Sem data de nascimento";
  return new Intl.DateTimeFormat("pt-PT", { dateStyle: "long" }).format(date);
}

function ageFrom(date: Date | null) {
  if (!date) return null;
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days < 31) return `${days} ${days === 1 ? "dia" : "dias"}`;
  const months = Math.floor(days / 30);
  if (months < 24) return `${months} ${months === 1 ? "mês" : "meses"}`;
  const years = Math.floor(months / 12);
  return `${years} ${years === 1 ? "ano" : "anos"}`;
}

export default async function ChildrenPage({ searchParams }: ChildrenPageProps) {
  const user = await requireUser();
  const params = searchParams ? await searchParams : undefined;
  const error = readParam(params?.error);
  const message = readParam(params?.message);

  const children = await db.child.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-5 fade-up">
      <PageHeader
        eyebrow="Família"
        title="Bebés"
        subtitle="Adiciona um bebé para começar a registar."
        icon="baby"
        accent="accent"
      />

      {message ? (
        <p className="rounded-xl bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-800 border border-emerald-200/60">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm text-rose-800 border border-rose-200/60">
          {error}
        </p>
      ) : null}

      <section className="card rounded-3xl p-5 sm:p-7">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)] mb-4">
          Adicionar bebé
        </h2>
        <form action={createChildAction} className="grid gap-4">
          <Field label="Nome">
            <input
              id="name"
              name="name"
              required
              className="input"
              placeholder="Ex: Maria"
            />
          </Field>
          <Field label="Data de nascimento (opcional)">
            <input id="birthDate" name="birthDate" type="date" className="input" />
          </Field>
          <Field label="Notas (opcional)">
            <textarea
              id="notes"
              name="notes"
              rows={3}
              className="input resize-none"
              placeholder="Ex: gémeo A"
            />
          </Field>
          <button
            type="submit"
            className="btn btn-primary w-full sm:w-auto sm:self-start"
          >
            <Icon name="plus" size={16} /> Adicionar bebé
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)] mb-3 px-1">
          Lista
        </h2>

        {children.length === 0 ? (
          <div className="card rounded-3xl p-8 text-center">
            <span className="grid place-items-center w-14 h-14 mx-auto rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] mb-3">
              <Icon name="baby" size={26} />
            </span>
            <p className="font-semibold">Ainda sem bebés</p>
            <p className="text-sm text-[var(--muted)] mt-1">
              Preenche o formulário acima para começar.
            </p>
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {children.map((child) => {
              const age = ageFrom(child.birthDate);
              return (
                <li
                  key={child.id}
                  className="card rounded-3xl p-5 flex gap-4"
                >
                  <span className="grid place-items-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8b6dff] to-[#7c5cff] text-white shadow-sm shrink-0">
                    <Icon name="baby" size={22} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <p className="font-semibold tracking-tight">
                        {child.name}
                      </p>
                      {age ? (
                        <span className="chip bg-[var(--accent-soft)] text-[var(--accent)]">
                          {age}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {formatDate(child.birthDate)}
                    </p>
                    {child.notes ? (
                      <p className="mt-2 text-sm text-[var(--muted)] line-clamp-2">
                        {child.notes}
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
        {label}
      </span>
      {children}
    </label>
  );
}
