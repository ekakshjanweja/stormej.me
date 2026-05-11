import { listProjects } from "@/lib/projects";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function Projects() {
  const projects = listProjects();
  return (
    <main>
      <div className="sticky top-16 z-20 -mx-2 mb-8 bg-background/85 px-2 py-3 backdrop-blur-md">
        <h1 className="section-label">projects</h1>
      </div>
      <ul className="flex flex-col gap-5">
        {projects
          .filter((project) => !project.hidden)
          .map((project) => {
            const hasDescription =
              project.description && project.description.length > 0;
            const href = hasDescription
              ? `/projects/${project.slug}`
              : project.website || `/projects/${project.slug}`;
            const isExternal = !hasDescription && !!project.website;

            return (
              <li key={project.slug}>
                <Link
                  href={href}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  className="group flex items-baseline justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="squiggle-link-hover text-[14px] font-medium text-foreground truncate">
                      {project.title}
                    </span>
                    <span className="text-[12px] font-light text-muted-foreground leading-snug">
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
    </main>
  );
}
