import { work } from "@/lib/constants/work";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const prms = await params;
  const slug = prms.slug;

  const item = work.find((item) => item.id === slug);

  if (item === undefined) {
    notFound();
  }

  return (
    <main>
      <div className="max-w-4xl mx-auto">
        {/* Enhanced Back Navigation */}
        <Link
          href="/work"
          className="group inline-flex items-center gap-2 mb-12 text-sm text-muted-foreground hover:text-foreground transition-all duration-300 hover:gap-3"
        >
          <span className="transform group-hover:-translate-x-1 transition-transform duration-300">
            ←
          </span>
          <span className="relative">
            back to work
            <span className="absolute inset-x-0 bottom-0 h-px bg-foreground/20 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
          </span>
        </Link>

        {/* Work Header */}
        <div className="mb-16">
          <div className="space-y-6">
            {/* 1. Title + Website */}
            <div className="flex items-center gap-2">
              {item.website ? (
                <a
                  href={item.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                  <p className="text-xl md:text-2xl font-semibold tracking-tight group-hover:text-primary transition-colors duration-200">
                    {item.title}
                  </p>
                </a>
              ) : (
                <p className="text-xl md:text-2xl font-semibold tracking-tight">
                  {item.title}
                </p>
              )}
            </div>

            {/* 2. Role + Timeline */}
            <div className="text-sm text-muted-foreground font-medium">
              {item.role} •{" "}
              {item.startDate
                .toLocaleString("default", {
                  month: "short",
                  year: "numeric",
                })
                .toLowerCase()}{" "}
              -{" "}
              {item.endDate
                ? item.endDate
                    .toLocaleString("default", {
                      month: "short",
                      year: "numeric",
                    })
                    .toLowerCase()
                : "present"}
            </div>

            {/* 3. Description */}
            {item.description && (
              <p className="text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            )}

            {/* 4. Tech Stack */}
            <div className="flex flex-wrap gap-1 mb-4">
              {item.tech.map((tech, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 rounded-md bg-muted/50 text-muted-foreground/70 font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 5. Highlights */}
        {item.highlights && item.highlights.length > 0 && (
          <div className="mb-8">
            <div className="space-y-3">
              {item.highlights.map((highlight, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 mt-2 bg-muted-foreground/60 rounded-full flex-shrink-0" />
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {highlight}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. Projects with Highlights */}
        {item.projects && (
          <div className="space-y-6">
            {item.projects.map((project, index) => (
              <div key={index} className="space-y-4">
                <h3 className="text-base font-semibold tracking-tight text-foreground">
                  {project.title}
                </h3>

                {/* App Store Links */}
                {(project.playstore || project.appstore || project.website) && (
                  <div className="flex flex-wrap gap-2">
                    {project.website && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={project.website}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          web
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </Button>
                    )}
                    {project.playstore && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={project.playstore}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          play store
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </Button>
                    )}
                    {project.appstore && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={project.appstore}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          app store
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                )}

                {/* Project Highlights */}
                {project.highlights && project.highlights.length > 0 && (
                  <div className="space-y-3">
                    {project.highlights.map((highlight, highlightIndex) => (
                      <div
                        key={highlightIndex}
                        className="flex items-start gap-3"
                      >
                        <span className="w-1.5 h-1.5 mt-2 bg-muted-foreground/60 rounded-full flex-shrink-0" />
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {highlight}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Separator */}
                {index < item.projects!.length - 1 && (
                  <div className="h-px bg-border/30" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
