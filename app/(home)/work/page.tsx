import { work } from "@/lib/constants/work";
import Link from "next/link";
import Image from "next/image";
import { WorkPreview } from "@/components/work-preview";

function formatRange(start: Date, end?: Date | null) {
  const fmt = (d: Date) =>
    d
      .toLocaleString("default", { month: "short", year: "numeric" })
      .toLowerCase();
  return `${fmt(start)} to ${end ? fmt(end) : "present"}`;
}

export default function Work() {
  return (
    <main>
      <h1 className="section-label mb-8">work</h1>
      <ul className="flex flex-col gap-6">
        {work.map((item) => (
          <li key={item.id}>
            <WorkPreview
              title={item.title}
              href={`/work/${item.id}`}
              logo={item.logo}
              images={item.images}
              screenshotMockup={item.screenshotMockup}
            >
              <Link
                href={`/work/${item.id}`}
                className="group flex flex-col gap-2 hover-dim focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
              >
                <div className="flex items-baseline justify-between gap-4">
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
