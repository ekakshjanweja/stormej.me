"use client";

import { projects } from "@/lib/constants/projects";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Projects() {
  return (
    <section className="mt-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
          projects
        </h2>
        {projects.length > 4 && (
          <Link
            href="/projects"
            className="group relative px-3 py-2 rounded-lg transition-all duration-300 ease-in-out hover:translate-x-0.5 focus:translate-x-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 border border-transparent text-muted-foreground hover:text-foreground hover:border-border/20 hover:bg-accent/10"
          >
            <span className="font-medium transition-all duration-300 ease-in-out">
              view all
            </span>
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects
          .filter((project) => !project.hidden)
          .slice(0, 4)
          .map((project, index) => {
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
                className={cn(
                  "group relative overflow-hidden rounded-lg",
                  "border border-border/10 bg-muted/30",
                  "hover:border-border/50 dark:hover:border-border/40",
                  "hover:bg-muted/50 dark:hover:bg-card/70",
                  "backdrop-blur-sm transition-all duration-700 ease-in-out",
                  "cursor-pointer p-4",
                  "hover:shadow-md hover:shadow-primary/10 dark:hover:shadow-primary/5",
                  "transform-gpu"
                )}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
              >
                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 dark:from-primary/5 dark:via-transparent dark:to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-in-out" />

                {/* Shimmer effect on hover */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1500 ease-in-out bg-gradient-to-r from-transparent via-primary/5 to-transparent dark:via-white/5 opacity-0 group-hover:opacity-100" />

                {/* Content */}
                <div className="relative flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors duration-700 ease-in-out truncate">
                      {project.title}
                    </h3>
                    <p className="text-sm text-muted-foreground font-medium transition-colors duration-700 ease-in-out mt-1 line-clamp-2 group-hover:text-muted-foreground/90">
                      {project.subtitle}
                    </p>
                  </div>
                  <ExternalLink
                    className={cn(
                      "w-4 h-4 text-muted-foreground/60",
                      "group-hover:text-primary transition-all duration-700 ease-in-out",
                      "group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
                      "flex-shrink-0"
                    )}
                  />
                </div>

                {/* Animated border */}
                <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-primary/20 dark:group-hover:border-primary/30 transition-all duration-700 ease-in-out" />
              </Link>
            );
          })}
      </div>
    </section>
  );
}
