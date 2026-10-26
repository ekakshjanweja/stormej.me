/* "agent" mode: every page, as the markdown an llm would want. built on the
   server at render time, so the numbers match the page */

import { withBase } from "@/lib/base";
import type { Case } from "@/lib/cases";
import { PROJECT_CASES, WORK_CASES } from "@/lib/cases";
import {
	GYM_CLIP,
	LINKS,
	monthYear,
	PERSON,
	PROJECTS,
	REELS,
	SITE,
	SOCIALS,
	STACK,
	STATS,
	WORK,
	WRITING,
	yearsShipping,
} from "@/lib/profile";
import {
	CAL,
	CARDS,
	caseHref,
	EMAIL,
	isExternal,
	ROUTES,
	WORLD_ORDER,
	WORLDS,
} from "./content";
import { dayMonthYear } from "./format";

/** internal paths get the base path, so they work wherever the lab lives */
const url = (href: string) => (isExternal(href) ? href : withBase(href));

const lines = (...parts: (string | false | undefined)[]) =>
	parts.filter((part) => part !== false && part !== undefined).join("\n");

const say = () =>
	lines(
		"## say hi",
		"",
		`- contact: ${url(ROUTES.contact)}`,
		`- book a call: ${CAL}`,
		`- email: ${EMAIL}`,
		`- full site: ${SITE}`
	);

const span = (start: string, end: string | null) =>
	`${monthYear(start)} → ${end ? monthYear(end) : "now"}`;

export const homeMarkdown = () =>
	lines(
		"# ekaksh janweja",
		"",
		`> ${PERSON.tagline} mostly mobile and ai.`,
		"",
		...WORLD_ORDER.flatMap((id) => [
			`## ${WORLDS[id].title}`,
			"",
			...CARDS.filter((card) => card.world === id).map(
				(card) => `- [${card.title}](${url(card.href)}): ${card.tag}`
			),
			`- everything: ${url(WORLDS[id].href)}`,
			"",
		]),
		"## about",
		"",
		`- who i am: ${url(ROUTES.about)}`,
		"",
		say()
	);

export const workMarkdown = () =>
	lines(
		`# ${WORLDS.work.title}`,
		"",
		`> i build products for startups, from idea to production. ${PERSON.subline}`,
		"",
		`${STATS.startups} startups, ${yearsShipping()} years shipping.`,
		"",
		...WORK.flatMap((job) => {
			const item = WORK_CASES.find((entry) => entry.slug === job.slug);
			return [
				`## ${job.company}`,
				"",
				`${job.role} · ${span(job.start, job.end)} · ${job.tech.join(", ")}`,
				"",
				job.summary,
				"",
				...(item ? [`- the case: ${url(caseHref(item))}`, ""] : []),
			];
		}),
		`next: ${WORLDS.build.title}, ${url(ROUTES.build)}`
	);

const ARCHIVE = PROJECTS.filter(
	(project) => !PROJECT_CASES.some((item) => item.slug === project.slug)
);

export const buildMarkdown = () =>
	lines(
		`# ${WORLDS.build.title}`,
		"",
		"> i build side projects for fun: small tools i wanted to exist.",
		"",
		"## featured",
		"",
		...PROJECT_CASES.flatMap((item) => [
			`### ${item.title}`,
			"",
			`${item.role} · ${item.when} · ${item.tech.join(", ")}`,
			"",
			item.challenge,
			"",
			`- the case: ${url(caseHref(item))}`,
			"",
		]),
		"## the archive",
		"",
		...ARCHIVE.map(
			(project) =>
				`- [${project.title}](${project.href}) · ${project.year}: ${project.summary} (${project.stack.join(", ")})`
		),
		"",
		`next: ${WORLDS.write.title}, ${url(ROUTES.write)}`
	);

export const writeMarkdown = () =>
	lines(
		`# ${WORLDS.write.title}`,
		"",
		"> write-ups for developers, and short reels from the desk.",
		"",
		"## notes",
		"",
		...WRITING.map(
			(post) =>
				`- [${post.title}](${post.href}) · ${dayMonthYear(post.date)}: ${post.summary}`
		),
		"",
		"## reels, on instagram",
		"",
		...REELS.map(
			(reel) =>
				`- [${reel.title}](${reel.href}) · ${dayMonthYear(reel.date)} · ${reel.kind}`
		),
		"",
		`- all of them: ${LINKS.instagram}`,
		"",
		`next: about, ${url(ROUTES.about)}`
	);

export const caseMarkdown = (item: Case, next: Case | undefined) =>
	lines(
		`# ${item.title}`,
		"",
		`> ${item.subtitle}`,
		"",
		`${item.role} · ${item.when} · ${item.tech.join(", ")}`,
		"",
		"## the challenge",
		"",
		item.challenge,
		"",
		"## tl;dr",
		"",
		...item.tldr.map((point) => `- ${point}`),
		"",
		"## outcomes",
		"",
		...item.outcomes.map((outcome) => `- ${outcome.metric}: ${outcome.label}`),
		"",
		...item.chapters.flatMap((chapter) => [
			`## ${chapter.title}`,
			"",
			...chapter.paragraphs.flatMap((paragraph) => [paragraph, ""]),
		]),
		"## links",
		"",
		...item.links.map((link) => `- [${link.label}](${link.href})`),
		`- the full write-up: ${item.source}`,
		"",
		next ? `next: [${next.title}](${url(caseHref(next))})` : false
	);

export const aboutMarkdown = () =>
	lines(
		`# ${PERSON.name}`,
		"",
		`> ${PERSON.tagline}`,
		"",
		PERSON.subline,
		"",
		`based in ${PERSON.location}.`,
		"",
		"## in numbers",
		"",
		`- ${STATS.startups} startups`,
		`- ${STATS.projects} projects`,
		`- ${yearsShipping()} years shipping`,
		`- ${STATS.contributions2025.toLocaleString("en-US")} contributions in 2025`,
		"",
		"## timeline",
		"",
		...WORK.map((job) => {
			const item = WORK_CASES.find((entry) => entry.slug === job.slug);
			const name = item
				? `[${job.company}](${url(caseHref(item))})`
				: job.company;
			return `- ${span(job.start, job.end)}: ${name}, ${job.role}`;
		}),
		"",
		"## stack",
		"",
		STACK.join(", "),
		"",
		"## off the clock",
		"",
		`- a clip from the gym: "${GYM_CLIP.title}"`,
		"",
		"## elsewhere",
		"",
		...SOCIALS.map((social) => `- ${social.label}: ${social.href}`),
		`- resume: ${LINKS.resume}`,
		"",
		say()
	);

export const contactMarkdown = () =>
	lines(
		"# contact",
		"",
		"> book a call, write an email, or find me online.",
		"",
		`- book a call: ${CAL}`,
		`- email: ${EMAIL}`,
		...SOCIALS.map((social) => `- ${social.label}: ${social.href}`),
		`- threads: ${LINKS.threads}`,
		`- resume: ${LINKS.resume}`,
		"",
		`i'm in ${PERSON.location}, on india standard time (utc+5:30).`
	);

export const notFoundMarkdown = () =>
	lines(
		"# not found",
		"",
		"> nothing hangs here.",
		"",
		`- the ring: ${url(ROUTES.home)}`,
		...WORLD_ORDER.map(
			(id) => `- ${WORLDS[id].title}: ${url(WORLDS[id].href)}`
		),
		`- about: ${url(ROUTES.about)}`,
		`- contact: ${url(ROUTES.contact)}`
	);
