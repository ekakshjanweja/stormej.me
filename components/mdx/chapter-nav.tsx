import { cn } from "@/lib/utils";

type ChapterNavItem = { id: string; label: string };

export function ChapterNav({
  items,
  label = "case study sections",
  sticky = false,
  className,
}: {
  items: ChapterNavItem[];
  label?: string;
  sticky?: boolean;
  className?: string;
}) {
  if (!items || items.length === 0) return null;
  return (
    <nav
      aria-label={label}
      className={cn(
        "mb-10 overflow-x-auto custom-scrollbar",
        sticky &&
          "sticky top-16 z-30 -mx-1 bg-background/85 px-1 py-2 backdrop-blur-md",
        className
      )}
    >
      <ul className="flex items-center gap-x-5 whitespace-nowrap">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="meta-tag hover-dim focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
