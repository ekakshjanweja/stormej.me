"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { track } from "@/lib/analytics";
import { listProjects } from "@/lib/projects";

export function Projects() {
	const projects = listProjects().filter((p) => !p.hidden);
	const visible = projects.slice(0, 4);

	return (
		<section data-cursor-anchor="projects">
			<div className="mb-6 flex items-baseline justify-between">
				<h2 className="section-label">projects</h2>
				{projects.length > 4 && (
					<Link
						className="meta-tag hover-dim rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
						href="/projects"
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
						? `/projects/${project.slug}`
						: project.website || `/projects/${project.slug}`;
					const isExternal = !hasDescription && !!project.website;

					return (
						<li key={project.slug}>
							<Link
								className="group hover-dim flex items-baseline justify-between gap-4 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
								href={href}
								onClick={() =>
									track("content_card_clicked", {
										external: isExternal,
										kind: "project",
										slug: project.slug,
										title: project.title,
									})
								}
								rel={isExternal ? "noopener noreferrer" : undefined}
								target={isExternal ? "_blank" : undefined}
							>
								<div className="flex min-w-0 flex-col gap-0.5">
									<span className="squiggle-link-hover truncate font-medium text-[14px] text-foreground">
										{project.title}
									</span>
									<span className="line-clamp-1 font-light text-[12px] text-muted-foreground leading-snug">
										{project.subtitle}
									</span>
								</div>
								{isExternal && (
									<ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
								)}
							</Link>
						</li>
					);
				})}
			</ul>
		</section>
	);
}
