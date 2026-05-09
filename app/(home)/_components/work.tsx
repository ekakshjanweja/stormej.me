import { listWork } from "@/lib/work";
import Link from "next/link";
import { WorkPreview } from "@/components/work-preview";
import { LogoTile } from "@/components/logo-tile";

function formatRange(start: Date, end?: Date | null) {
  const fmt = (d: Date) =>
    d
      .toLocaleString("default", { month: "short", year: "numeric" })
      .toLowerCase();
  return `${fmt(start)} to ${end ? fmt(end) : "present"}`;
}

export default function Work() {
  const work = listWork();
  return (
    <section data-cursor-anchor="work">
      <div className="mb-6">
        <h2 className="section-label">work</h2>
      </div>
      <ul className="flex flex-col">
        {work.map((item) => (
          <li key={item.slug} className="py-4 first:pt-0 last:pb-0">
            <WorkPreview
              title={item.title}
              href={`/work/${item.slug}`}
              logo={item.logo}
              images={item.images}
              screenshotMockup={item.screenshotMockup}
            >
              <Link
                href={`/work/${item.slug}`}
                className="group flex items-center gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
              >
                {item.logo ? (
                  <LogoTile src={item.logo} size={36} />
                ) : (
                  <span
                    aria-hidden
                    className="font-serif italic text-[34px] leading-none text-foreground/85 w-9 shrink-0 text-center select-none"
                    style={{
                      fontFamily: "var(--font-instrument-serif), serif",
                    }}
                  >
                    {item.title.charAt(0).toLowerCase()}
                  </span>
                )}
                <div className="flex items-center justify-between gap-4 min-w-0 flex-1">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-baseline gap-2 min-w-0">
                      <span className="text-[14px] font-medium text-foreground truncate group-hover:underline underline-offset-4 decoration-1">
                        {item.title}
                      </span>
                      <span
                        aria-hidden
                        className="text-[14px] text-muted-foreground opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0"
                      >
                        →
                      </span>
                    </div>
                    <span className="text-[12px] font-light text-muted-foreground leading-tight">
                      {item.role}
                    </span>
                  </div>
                  <span className="meta-tag whitespace-nowrap shrink-0">
                    {formatRange(item.startDate, item.endDate)}
                  </span>
                </div>
              </Link>
            </WorkPreview>
          </li>
        ))}
      </ul>
    </section>
  );
}
