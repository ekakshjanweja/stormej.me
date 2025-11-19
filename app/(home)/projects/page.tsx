import { projects } from "@/lib/constants/projects";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Projects() {
  return (
    <main>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-lg md:text-xl font-semibold tracking-tight">
          projects
        </h1>
      </div>

      {/* Projects List */}
      <div className="flex flex-col gap-4">
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
                <div
                  className={cn(
                    "group relative overflow-hidden rounded-lg",
                    "border border-border/10 bg-muted/30",
                    "hover:border-border/50 dark:hover:border-border/40",
                    "hover:bg-muted/50 dark:hover:bg-card/70",
                    "backdrop-blur-sm transition-all duration-700 ease-in-out",
                    "cursor-pointer p-3",
                    "hover:shadow-md hover:shadow-primary/10 dark:hover:shadow-primary/5",
                    "transform-gpu"
                  )}
                >
                  {/* Animated gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 dark:from-primary/5 dark:via-transparent dark:to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-in-out" />

                  {/* Shimmer effect on hover */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1500 ease-in-out bg-gradient-to-r from-transparent via-primary/5 to-transparent dark:via-white/5 opacity-0 group-hover:opacity-100" />

                  {/* Content */}
                  <div className="relative flex flex-col gap-2.5">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex flex-col gap-0.5">
                        <h3 className="text-sm md:text-base font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors duration-700 ease-in-out">
                          {project.title}
                        </h3>
                        <p className="text-xs md:text-sm text-muted-foreground font-medium transition-colors duration-700 ease-in-out group-hover:text-muted-foreground/90">
                          {project.subtitle}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* External Link Icon - Top Right */}
                  {isExternal && (
                    <div className="absolute top-2.5 right-2.5">
                      <ExternalLink
                        className={cn(
                          "w-3.5 h-3.5 text-muted-foreground/60",
                          "group-hover:text-primary transition-all duration-700 ease-in-out",
                          "group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        )}
                      />
                    </div>
                  )}

                  {/* Animated border */}
                  <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-primary/20 dark:group-hover:border-primary/30 transition-all duration-700 ease-in-out" />
                </div>
              </Link>
            );
          })}
      </div>
    </main>
  );
}
