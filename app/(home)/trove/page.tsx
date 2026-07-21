import type { Metadata } from "next";
import Link from "next/link";
import { listTrove } from "@/lib/trove";

const description = "flutter stuff i actually use. copy one file, ship.";

export const metadata: Metadata = {
  title: "trove",
  description,
  alternates: { canonical: "/trove" },
  openGraph: {
    title: "trove | stormej",
    description,
    url: "https://www.stormej.me/trove",
    type: "website",
    images: [
      {
        url: "/og/trove",
        width: 1200,
        height: 630,
        alt: "stormej — trove",
      },
    ],
  },
  twitter: {
    title: "trove | stormej",
    description,
    images: ["/og/trove"],
  },
};

export default function Trove() {
  const items = listTrove();

  return (
    <main>
      <div className="sticky top-16 z-20 -mx-2 mb-8 bg-background/85 px-2 py-3 backdrop-blur-md">
        <h1 className="section-label">trove</h1>
      </div>
      <p className="mb-8 text-pretty text-[13px] font-light leading-[1.6] text-muted-foreground">
        {description}
      </p>
      <ul className="flex flex-col gap-5">
        {items.map((item) => (
          <li key={item.slug}>
            <Link
              href={item.url}
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
          </li>
        ))}
      </ul>
    </main>
  );
}
