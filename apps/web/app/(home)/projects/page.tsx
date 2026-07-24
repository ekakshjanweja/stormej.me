import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { listProjects } from "@/lib/projects";

const description = "side projects, experiments, and things i've shipped";

export const metadata: Metadata = {
	alternates: { canonical: "/projects" },
	description,
	openGraph: {
		description,
		images: [
			{
				alt: "stormej — projects",
				height: 630,
				url: "/og/projects",
				width: 1200,
			},
		],
		title: "projects | stormej",
		type: "website",
		url: "https://www.stormej.me/projects",
	},
	title: "projects",
	twitter: {
		description,
		images: ["/og/projects"],
		title: "projects | stormej",
	},
};

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
									className="group flex items-baseline justify-between gap-4 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
									href={href}
									rel={isExternal ? "noopener noreferrer" : undefined}
									target={isExternal ? "_blank" : undefined}
								>
									<div className="flex min-w-0 flex-col gap-0.5">
										<span className="squiggle-link-hover truncate font-medium text-[14px] text-foreground">
											{project.title}
										</span>
										<span className="font-light text-[12px] text-muted-foreground leading-snug">
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
		</main>
	);
}
