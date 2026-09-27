import type { Metadata } from "next";
import { listProjects } from "@/lib/projects";
import { ArchivedProjects } from "./archived-projects";
import { ProjectRow } from "./project-row";

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
	const projects = listProjects().filter((project) => !project.hidden);
	const active = projects.filter((project) => !project.archived);
	const archived = projects.filter((project) => project.archived);

	return (
		<main>
			<h1 className="sr-only">projects</h1>
			<ul className="flex flex-col gap-5">
				{active.map((project) => (
					<ProjectRow key={project.slug} project={project} />
				))}
			</ul>
			<ArchivedProjects projects={archived} />
		</main>
	);
}
