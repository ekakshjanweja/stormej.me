"use client";

import { projects } from "@/lib/constants/projects";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function Projects() {
  const visible = projects.filter((p) => !p.hidden).slice(0, 4);

  return (
    <section data-cursor-anchor="projects">
      <div className="flex justify-between items-baseline mb-6">
        <h2 className="section-label">projects</h2>
        {projects.filter((p) => !p.hidden).length > 4 && (
          <Link
            href="/projects"
            className="meta-tag hover-dim focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
          >
            view all
          </Link>
        )}
      </div>
      <ul className="flex flex-col gap-4">
        {visible.map((project) => {
          const hasDescription =
            project.description && project.description.length > 0;
          const href = hasDescription
            ? `/projects/${project.id}`
            : project.website || `/projects/${project.id}`;
          const isExternal = !hasDescription && !!project.website;

          return (
            <li key={project.id}>
              <Link
                href={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className="group flex items-baseline justify-between gap-4 hover-dim focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-[14px] font-medium text-foreground truncate">
                    {project.title}
                  </span>
                  <span className="text-[12px] font-light text-muted-foreground leading-snug line-clamp-1">
                    {project.subtitle}
                  </span>
                </div>
                {isExternal && (
                  <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
