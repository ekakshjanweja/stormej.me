import { projects } from "@/lib/constants/projects";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export default function Projects() {
  return (
    <main>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
          projects
        </h1>
      </div>

      {/* Projects List */}
      <div className="flex flex-col gap-6">
        {projects
          .filter((project) => !project.hidden)
          .map((project) => {
            const hasDescription =
              project.description && project.description.length > 0;
            const href = hasDescription
              ? `/projects/${project.id}`
              : project.website || `/projects/${project.id}`;
            const isExternal = !hasDescription && project.website;

            return (
              <Link
                key={project.id}
                href={href}
                className="group"
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
              >
                <div className="group relative overflow-hidden rounded-lg border border-border/10 bg-muted/30 hover:border-border/30 hover:bg-card/50 backdrop-blur-sm transition-all duration-300 ease-out cursor-pointer p-4 hover:shadow-sm hover:shadow-primary/5">
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Content */}
                  <div className="relative flex flex-col gap-3">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex flex-col gap-1">
                        <h3 className="text-base font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors duration-300">
                          {project.title}
                        </h3>
                        <p className="text-sm text-muted-foreground font-medium transition-colors duration-300">
                          {project.subtitle}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* External Link Icon - Top Right */}
                  {isExternal && (
                    <div className="absolute top-3 right-3">
                      <ExternalLink className="w-4 h-4 text-muted-foreground/60 group-hover:text-primary transition-colors duration-300" />
                    </div>
                  )}

                  {/* Subtle border animation */}
                  <div className="absolute inset-0 rounded-lg border border-transparent group-hover:border-primary/20 transition-all duration-500" />
                </div>
              </Link>
            );
          })}
      </div>
    </main>
  );
}
