/* the studio's words. every fact comes from lib/profile; this file only
   decides what goes where */

import { withBase } from "@/lib/base";
import {
	LINKS,
	PERSON,
	PLAYABLE_REELS,
	PROJECTS,
	type Project,
	REELS,
	STACK,
	STATS,
	WORK,
	WRITING,
	yearsShipping,
} from "@/lib/profile";

const current = WORK.find((job) => job.end === null);

export const FACTS = [
	current ? `${current.role} at ${current.company}` : PERSON.role,
	PERSON.location,
	`${yearsShipping()} years shipping`,
	`${STATS.contributions2025.toLocaleString("en-US")} contributions in 2025`,
];

export const HERO = {
	teamsLabel: "shipped with the teams at",
	text: PERSON.subline,
	title: "early-stage engineer for ideas that need to ship",
};

/** each team links to its case study */
export const TEAMS = WORK.map((job) => ({
	href: `/studio/work/${job.slug}`,
	name: job.company,
	slug: job.slug,
}));

export const USPS = {
	cards: [
		{
			art: "squares",
			text: "flutter apps from zero: an ar capture pipeline, a digital mailbox, a remote for bluetooth lights.",
			title: "mobile apps",
		},
		{
			art: "stack",
			text: "a voice-first email client and a home-loan advisor you can talk to. pipecat, the ai sdk, workers.",
			title: "voice and ai",
		},
		{
			art: "circles",
			text: "swiftui and appkit for burrow on the mac. arkit and lidar on the iphone at bullzeye.",
			title: "native mac and ios",
		},
		{
			art: "turns",
			text: "first mobile hire at digital domi, founding engineer at bullzeye. comfortable before there's a spec.",
			title: "zero to one",
		},
	] as const,
	text: "i step in where an idea has to become real software: the app, the backend behind it, and the polish people notice.",
	title: "one engineer, the whole product.",
};

export type ArtKind = (typeof USPS.cards)[number]["art"];

/* a caption from stormej.studio, in his own words */
const quoteReel = REELS.find((reel) => reel.title.startsWith("voice agents"));

export const QUOTE = {
	href: quoteReel?.href ?? LINKS.instagram,
	source: "on stormej.studio",
	text: `${quoteReel?.title ?? "same code. better coffee."}.`,
};

/** screenshots and covers the image trail scatters */
export const TRAIL_IMAGES = [
	...PROJECTS.flatMap((project) => (project.image ? [project.image] : [])),
	...WORK.flatMap((job) => (job.image ? [job.image] : [])),
	withBase("/media/lumen-color.webp"),
	withBase("/media/fpv-recording.webp"),
	withBase("/media/wallflower.webp"),
	...REELS.map((reel) => reel.cover),
];

/* in the order stormej.me lists them */
const DELIVERED = new Set(["lumen", "burrow", "aarthiqai", "turi"]);

export const DELIVERIES: Project[] = PROJECTS.filter((project) =>
	DELIVERED.has(project.slug)
);

/* the showreel is the stormej.studio reels, with their sound */
export const SHOWREEL = {
	label: "watch the reels",
	reels: PLAYABLE_REELS,
};

export const CATCHPHRASE = "got an idea that needs to ship?";

export const WAYS = {
	options: [
		{
			cards: [
				{
					text: "we cut the idea down to something that can ship: the screens, the backend, and what can wait.",
					title: "scope",
				},
				{
					text: "flutter, swift or the web, with the backend behind it. progress shows up as builds you can open.",
					title: "build",
				},
				{
					text: "app store, play store or the web. then the unglamorous part: crashes, uploads, edge cases.",
					title: "ship",
				},
			],
			id: "project",
			label: "one project",
		},
		{
			cards: [
				{
					text: "the product end to end: mobile, backend, infra, and a say in what gets built next.",
					title: "what i own",
				},
				{
					text: "close to founders and users. small releases, written decisions, quick feedback loops.",
					title: "how i work",
				},
			],
			id: "founding",
			label: "founding engineer",
		},
	],
	text: "two shapes this usually takes. either way you work with me directly.",
	title: "how we can work",
} as const;

const [latest] = WRITING;

export const FAQS = [
	{
		answer: `mostly ${STACK.slice(0, 4).join(", ")}, plus ${STACK.slice(4).join(", ")}.`,
		question: "what do you build with?",
	},
	{
		answer: `${PERSON.location}, on india standard time (utc+5:30).`,
		question: "where are you based?",
	},
	{
		answer: current
			? `right now i'm ${current.role} at ${current.company}. if you're building something interesting, say hi anyway.`
			: "yes. say hi and tell me what you're building.",
		question: "are you taking on work?",
	},
	{
		answer: `${WORK.length} teams and ${PROJECTS.length} side projects so far. every one of them is on the work page.`,
		link: { href: "/studio/work", label: "see the work" },
		question: "what have you shipped?",
	},
	{
		answer: latest
			? `sometimes. the latest is "${latest.title}".`
			: "sometimes, on stormej.me.",
		link: { href: "/studio/writing", label: "read the notes" },
		question: "do you write about it?",
	},
	{
		answer: `email ${PERSON.email}, or book a call on cal.com.`,
		question: "how do i reach you?",
	},
];

export const CTA = {
	button: "book a call",
	title: "let's build your thing.",
};

export const LATEST_POST = latest;
