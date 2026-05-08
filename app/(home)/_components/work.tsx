import { work } from "@/lib/constants/work";
import Link from "next/link";
import Image from "next/image";

function formatRange(start: Date, end?: Date | null) {
  const fmt = (d: Date) =>
    d
      .toLocaleString("default", { month: "short", year: "numeric" })
      .toLowerCase();
  return `${fmt(start)} – ${end ? fmt(end) : "present"}`;
}

export default function Work() {
  return (
    <section data-cursor-anchor="work">
      <div className="flex justify-between items-baseline mb-6">
        <h2 className="section-label">work</h2>
        {work.length > 2 && (
          <Link
            href="/work"
            className="meta-tag hover-dim focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
          >
            view all
          </Link>
        )}
      </div>
      <ul className="flex flex-col gap-5">
        {work.slice(0, 2).map((item) => (
          <li key={item.id}>
            <Link
              href={`/work/${item.id}`}
              className="group flex items-baseline justify-between gap-4 hover-dim focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
            >
              <div className="flex items-center gap-3 min-w-0">
                {item.logo && (
                  <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-md bg-muted/40">
                    <Image
                      src={item.logo}
                      alt=""
                      fill
                      className="object-contain p-1"
                    />
                  </span>
                )}
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-[14px] font-medium text-foreground truncate">
                    {item.title}
                  </span>
                  <span className="text-[12px] font-light text-muted-foreground leading-tight">
                    {item.role}
                  </span>
                </div>
              </div>
              <span className="meta-tag whitespace-nowrap shrink-0">
                {formatRange(item.startDate, item.endDate)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
