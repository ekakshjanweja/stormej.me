import { work } from "@/lib/constants/work";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

function formatRange(start: Date, end?: Date | null) {
  const fmt = (d: Date) =>
    d
      .toLocaleString("default", { month: "short", year: "numeric" })
      .toLowerCase();
  return `${fmt(start)} – ${end ? fmt(end) : "present"}`;
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = work.find((i) => i.id === slug);
  if (!item) notFound();

  return (
    <main>
      <Link
        href="/work"
        className="meta-tag hover-dim inline-flex items-center gap-1.5 mb-12 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
      >
        ← back
      </Link>

      <header className="mb-10 space-y-4">
        <div className="flex items-center gap-3">
          {item.logo && (
            <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md bg-muted/40">
              <Image
                src={item.logo}
                alt=""
                fill
                className="object-contain p-1.5"
              />
            </span>
          )}
          {item.website ? (
            <a
              href={item.website}
              target="_blank"
              rel="noopener noreferrer"
              className="headline text-[clamp(22px,2.4vw,30px)] hover-dim inline-flex items-center gap-2"
            >
              {item.title}
              <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
            </a>
          ) : (
            <h1 className="headline text-[clamp(22px,2.4vw,30px)]">
              {item.title}
            </h1>
          )}
        </div>

        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-[14px] font-light text-foreground">
            {item.role}
          </span>
          <span className="meta-tag">
            {formatRange(item.startDate, item.endDate)}
          </span>
        </div>

        {item.description && (
          <p className="text-[14px] font-light leading-[1.6] text-muted-foreground">
            {item.description}
          </p>
        )}

        {item.tech && item.tech.length > 0 && (
          <p className="meta-tag">{item.tech.join(" · ")}</p>
        )}
      </header>

      {item.highlights && item.highlights.length > 0 && (
        <section className="mb-10">
          <h2 className="section-label mb-5">highlights</h2>
          <ul className="space-y-3">
            {item.highlights.map((highlight, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-[14px] font-light leading-[1.6] text-foreground"
              >
                <span className="select-none text-muted-foreground mt-[2px]">
                  —
                </span>
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {item.projects && item.projects.length > 0 && (
        <section>
          <h2 className="section-label mb-6">projects</h2>
          <div className="space-y-8">
            {item.projects.map((project, i) => (
              <div key={i} className="space-y-3">
                <h3 className="headline text-[18px]">{project.title}</h3>
                {(project.website || project.playstore || project.appstore) && (
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]">
                    {project.website && (
                      <a
                        href={project.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover-dim inline-flex items-center gap-1 text-foreground"
                      >
                        web <ArrowUpRight className="w-3 h-3" />
                      </a>
                    )}
                    {project.playstore && (
                      <a
                        href={project.playstore}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover-dim inline-flex items-center gap-1 text-foreground"
                      >
                        play store <ArrowUpRight className="w-3 h-3" />
                      </a>
                    )}
                    {project.appstore && (
                      <a
                        href={project.appstore}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover-dim inline-flex items-center gap-1 text-foreground"
                      >
                        app store <ArrowUpRight className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}
                {project.highlights && project.highlights.length > 0 && (
                  <ul className="space-y-2.5">
                    {project.highlights.map((h, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-3 text-[14px] font-light leading-[1.6] text-foreground"
                      >
                        <span className="select-none text-muted-foreground mt-[2px]">
                          —
                        </span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
