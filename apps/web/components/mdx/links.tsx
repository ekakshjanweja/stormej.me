import { ArrowUpRight } from "lucide-react";

type LinkItem = { label: string; href: string };

export function Links({
  title,
  items,
}: {
  title?: string;
  items: LinkItem[];
}) {
  if (!items || items.length === 0) return null;
  return (
    <section className="my-6 space-y-3">
      {title && <h3 className="headline text-[18px]">{title}</h3>}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]">
        {items.map((item, i) => (
          <a
            key={i}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="hover-dim inline-flex items-center gap-1 text-foreground"
          >
            {item.label} <ArrowUpRight className="w-3 h-3" />
          </a>
        ))}
      </div>
    </section>
  );
}
