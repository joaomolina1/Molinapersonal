import type { IconName } from "./Icon";
import Icon from "./Icon";

interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  icon?: IconName;
  accent?: "primary" | "bottle" | "accent";
  right?: React.ReactNode;
}

const ACCENT_BG: Record<NonNullable<Props["accent"]>, string> = {
  primary: "from-[#f06292] to-[#e94e77]",
  bottle: "from-[#6aa1ff] to-[#4f8cff]",
  accent: "from-[#8b6dff] to-[#7c5cff]",
};

export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  icon,
  accent = "primary",
  right,
}: Props) {
  return (
    <div className="flex items-start gap-3 sm:gap-4">
      {icon ? (
        <span
          className={`grid place-items-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl text-white bg-gradient-to-br ${ACCENT_BG[accent]} shadow-sm shrink-0`}
        >
          <Icon name={icon} size={22} />
        </span>
      ) : null}
      <div className="min-w-0 flex-1">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-[var(--muted)]">{subtitle}</p>
        ) : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}
