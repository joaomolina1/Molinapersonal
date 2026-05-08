import Link from "next/link";

interface Child {
  id: string;
  name: string;
}

interface Props {
  basePath: string;
  items: Child[];
  selectedId: string;
}

export default function ChildSwitcher({ basePath, items, selectedId }: Props) {
  if (items.length <= 1) return null;

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
      {items.map((c) => {
        const active = c.id === selectedId;
        return (
          <Link
            key={c.id}
            href={`${basePath}?childId=${c.id}`}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap border transition ${
              active
                ? "bg-gradient-to-br from-[#f06292] to-[#e94e77] text-white border-transparent shadow-sm"
                : "bg-white/70 text-[var(--muted)] border-[var(--border)] hover:bg-white hover:text-[var(--foreground)]"
            }`}
          >
            {c.name}
          </Link>
        );
      })}
    </div>
  );
}
