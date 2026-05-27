import Link from "next/link";
import Icon, { type IconName } from "./Icon";

type Tone = "primary" | "bottle" | "accent";

const TONE_STYLES: Record<Tone, { bg: string; text: string }> = {
  primary: { bg: "bg-[var(--primary-soft)]", text: "text-[var(--primary)]" },
  bottle: { bg: "bg-[var(--bottle-soft)]", text: "text-[var(--bottle)]" },
  accent: { bg: "bg-[var(--accent-soft)]", text: "text-[var(--accent)]" },
};

interface Props {
  icon: IconName;
  title: string;
  description: string;
  tone?: Tone;
  action?: { href: string; label: string };
}

export default function EmptyState({
  icon,
  title,
  description,
  tone = "primary",
  action,
}: Props) {
  const styles = TONE_STYLES[tone];

  return (
    <div className="flex flex-col items-center text-center py-8 px-4">
      <span
        className={`grid place-items-center w-14 h-14 rounded-2xl ${styles.bg} ${styles.text} mb-4`}
      >
        <Icon name={icon} size={26} />
      </span>
      <p className="font-semibold text-[var(--foreground)]">{title}</p>
      <p className="mt-1.5 text-sm text-[var(--muted)] max-w-xs leading-relaxed">
        {description}
      </p>
      {action ? (
        <Link href={action.href} className="btn btn-primary mt-5 text-sm">
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
