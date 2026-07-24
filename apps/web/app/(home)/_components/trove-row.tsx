"use client";

import Link from "next/link";
import { track } from "@/lib/analytics";
import { listTrove } from "@/lib/trove";
import { TrovePreview } from "@/components/trove/trove-preview";

const HOME_LIMIT = 2;

export const TroveRow = () => {
  const items = listTrove();
  if (items.length === 0) return null;

  return (
    <section data-cursor-anchor="trove">
      <div className="flex justify-between items-baseline mb-6">
        <h2 className="section-label">trove</h2>
        {items.length > HOME_LIMIT && (
          <Link
            href="/trove"
            onClick={() =>
              track("nav_link_clicked", {
                href: "/trove",
                label: "view all",
                surface: "home_trove",
              })
            }
            className="meta-tag hover-dim focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
          >
            view all
          </Link>
        )}
      </div>
      <ul className="flex flex-col gap-4">
        {items.slice(0, HOME_LIMIT).map((item) => (
          <li key={item.slug}>
            <TrovePreview
              title={item.title}
              demo={item.demo}
              surface="home_trove"
            >
              <Link
                href={item.url}
                onClick={() =>
                  track("nav_link_clicked", {
                    href: item.url,
                    label: item.title,
                    surface: "home_trove",
                  })
                }
                className="group flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="squiggle-link-hover text-[14px] font-medium text-foreground sm:truncate">
                    {item.title}
                  </span>
                  {(item.description ?? item.subtitle) && (
                    <span className="text-[12px] font-light text-muted-foreground leading-snug sm:line-clamp-1">
                      {item.description ?? item.subtitle}
                    </span>
                  )}
                </div>
                <span className="meta-tag shrink-0 whitespace-nowrap tabular-nums">
                  {item.sourceFile ?? item.tech.join(" · ")}
                </span>
              </Link>
            </TrovePreview>
          </li>
        ))}
      </ul>
    </section>
  );
};
