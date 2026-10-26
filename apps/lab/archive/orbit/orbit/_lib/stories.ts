/* what each job or project shows on its world's page: a few phones, a clip,
   or its line set in type when there's nothing to look at */

import type { Case } from "@/lib/cases";
import { caseFor } from "@/lib/cases";
import { type Job, monthYear, type Project } from "@/lib/profile";
import type { StoryMedia } from "../_components/story";
import { caseHref } from "./content";

/** how many tl;dr points a story card carries */
const POINTS = 3;

export const span = (start: string, end: string | null) =>
	`${monthYear(start)} → ${end ? monthYear(end) : "now"}`;

const phoneShots = (item: Case | undefined) =>
	item?.galleryShape === "phone" ? item.gallery : [];

export interface StoryEntry {
	href: string;
	media: StoryMedia;
	points: string[];
	role: string;
	slug: string;
	summary: string;
	tech: string[];
	title: string;
	when: string;
}

export const jobStory = (job: Job): StoryEntry => {
	const item = caseFor(job.slug);
	const shots = phoneShots(item);
	let media: StoryMedia = {
		kicker: job.role,
		kind: "type",
		line: item?.subtitle ?? job.summary,
	};
	if (shots.length > 0) {
		media = { kind: "phones", shots };
	} else if (job.image) {
		media = { kind: "phones", shots: [job.image] };
	}
	return {
		href: item ? caseHref(item) : job.href,
		media,
		points: item ? item.tldr.slice(0, POINTS) : [],
		role: job.role,
		slug: job.slug,
		summary: job.summary,
		tech: job.tech,
		title: job.company,
		when: span(job.start, job.end),
	};
};

const projectMedia = (item: Case, project: Project | undefined) => {
	const shots = phoneShots(item);
	if (project?.video && project.image) {
		if (project.orientation === "landscape") {
			return {
				kind: "clip",
				poster: project.image,
				video: project.video,
			} satisfies StoryMedia;
		}
		return {
			kind: "phones",
			shots,
			video: { poster: project.image, src: project.video },
		} satisfies StoryMedia;
	}
	if (shots.length > 0) {
		return { kind: "phones", shots } satisfies StoryMedia;
	}
	return {
		kicker: item.role,
		kind: "type",
		line: item.subtitle,
	} satisfies StoryMedia;
};

export const projectStory = (
	item: Case,
	project: Project | undefined
): StoryEntry => ({
	href: caseHref(item),
	media: projectMedia(item, project),
	points: item.tldr.slice(0, POINTS),
	role: item.role,
	slug: item.slug,
	summary: project?.summary ?? item.challenge,
	tech: item.tech,
	title: item.title,
	when: item.when,
});
