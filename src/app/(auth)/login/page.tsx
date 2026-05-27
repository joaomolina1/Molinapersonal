import Link from "next/link";
import { loginAction } from "@/app/actions/auth";
import Icon from "@/components/Icon";
import GoogleButton from "@/components/GoogleButton";

type AuthPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(value: string | string[] | undefined) {
  if (!value) return "";
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: AuthPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const error = readParam(params?.error);
  const message = readParam(params?.message);

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5 py-10 overflow-hidden">
      <div className="hero-orb w-56 h-56 bg-[#ffc8d7]/40 -top-16 -right-20" aria-hidden />
      <div className="hero-orb w-48 h-48 bg-[#c4b5ff]/30 bottom-0 -left-16" aria-hidden />

      <Link
        href="/"
        className="relative inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] mb-5 self-start transition-colors"
      >
        <Icon name="back" size={16} /> Voltar
      </Link>

      <div className="card rounded-3xl p-7 sm:p-8 fade-up relative">
        <span className="grid place-items-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#f06b92] to-[var(--primary)] text-white shadow-sm mb-4">
          <Icon name="drop" size={22} />
        </span>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Bem-vindo de volta
        </h1>
        <p className="mt-1.5 text-sm text-[var(--muted)]">
          Entra com o teu email e palavra-passe.
        </p>

        {message ? <p className="alert alert-success mt-5">{message}</p> : null}
        {error ? <p className="alert alert-error mt-5">{error}</p> : null}

        <div className="mt-6">
          <GoogleButton label="Entrar com Google" />
        </div>

        <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-wider text-[var(--muted)]">
          <span className="flex-1 h-px bg-[var(--border)]" />
          ou com email
          <span className="flex-1 h-px bg-[var(--border)]" />
        </div>

        <form action={loginAction} className="space-y-4">
          <Field id="email" label="Email" name="email" type="email" required />
          <Field
            id="password"
            label="Palavra-passe"
            name="password"
            type="password"
            required
            minLength={6}
          />
          <button type="submit" className="btn btn-primary w-full mt-2">
            Entrar
            <Icon name="right" size={16} />
          </button>
        </form>

        <p className="mt-7 text-sm text-[var(--muted)] text-center">
          Ainda não tens conta?{" "}
          <Link
            href="/register"
            className="font-semibold text-[var(--primary)] hover:underline"
          >
            Criar conta
          </Link>
        </p>
      </div>
    </main>
  );
}

function Field({
  id,
  label,
  ...rest
}: { id: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]"
      >
        {label}
      </label>
      <input id={id} className="input" {...rest} />
    </div>
  );
}
