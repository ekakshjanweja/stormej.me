import {
  formatTotalExperienceAriaLabel,
  formatTotalExperienceShort,
  listWork,
} from "@/lib/work";
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
  const totalExp = formatTotalExperienceShort(work);
  const totalExpAria = formatTotalExperienceAriaLabel(work);
  return (
    <main>
      <div className="sticky top-16 z-20 -mx-2 mb-8 bg-background/85 px-2 py-3 backdrop-blur-md">
        <h1 className="section-label inline-flex min-w-0 flex-wrap items-baseline gap-x-1.5">
          <span>work</span>
          {totalExp ? (
            <span
              className="meta-tag normal-case tracking-[0.06em]"
              aria-label={totalExpAria}
            >
              ({totalExp})
            </span>
          ) : null}
        </h1>
      </div>
      <ul className="flex flex-col gap-6">
        {work.map((item) => (
          <li key={item.slug}>
            <WorkPreview
              title={item.title}
              href={`/work/${item.slug}`}
              logo={item.logo}
              images={item.images}
              screenshotMockup={item.screenshotMockup}
            >
              <Link
                href={`/work/${item.slug}`}
                className="group flex flex-col gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {item.logo && (
                      <LogoTile
                        src={item.logo}
                        boxClassName="h-7 w-7"
                        imagePadClassName="p-1"
                      />
                    )}
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="squiggle-link-hover text-[14px] font-medium text-foreground truncate">
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
                </div>
                {item.description && (
                  <p className="text-[13px] font-light leading-[1.55] text-muted-foreground pl-10">
                    {item.description}
                  </p>
                )}
              </Link>
            </WorkPreview>
          </li>
        ))}
      </ul>
    </main>
  );
}
