/* what the inner pages say and list. like content.ts, every fact comes from
   lib/profile and lib/cases; this file only shapes and counts them */

import {
	CASES,
	type Case,
	caseFor,
	PROJECT_CASES,
	WORK_CASES,
} from "@/lib/cases";
import {
	monthYear,
	PROJECTS,
	REELS,
	STACK,
	WORK,
	WRITING,
} from "@/lib/profile";

const WORDS = [
	"no",
	"one",
	"two",
	"three",
	"four",
	"five",
	"six",
	"seven",
	"eight",
	"nine",
	"ten",
	"eleven",
	"twelve",
];

/** small counts read better as words: 6 → "six" */
export const inWords = (count: number) => WORDS[count] ?? String(count);

/** "01", "02" … */
export const pad = (value: number) => String(value).padStart(2, "0");

/* ---------- the work index ---------- */

export type EntryKind = "team" | "own" | "archive";

export interface WorkEntry {
	/** a short line: the role for a case, the summary for the archive */
	detail: string;
	external: boolean;
	href: string;
	/** the first screenshot, if there is one */
	image?: string;
	kind: EntryKind;
	/** a big word for the typographic preview when there's no image */
	metric: string;
	metricLabel: string;
	shape: "phone" | "wide";
	slug: string;
	stack: string[];
	title: string;
	when: string;
}

export const caseHref = (slug: string) => `/studio/work/${slug}`;

/* phone cases use the screenshot stormej.me picked for them; mac and web
   cases use their first full-size screen */
const imageFor = (item: Case) => {
	const job = WORK.find((entry) => entry.slug === item.slug);
	const project = PROJECTS.find((entry) => entry.slug === item.slug);
	const picked = job?.image ?? project?.image;
	if (item.galleryShape === "phone" && picked) {
		return picked;
	}
	return item.gallery[0] ?? picked;
};

const fromCase = (item: Case): WorkEntry => {
	const outcome = item.outcomes.at(0);
	return {
		detail: item.role,
		external: false,
		href: caseHref(item.slug),
		image: imageFor(item),
		kind: item.kind === "work" ? "team" : "own",
		metric: outcome?.metric ?? item.when,
		metricLabel: outcome?.label ?? item.role,
		shape: item.galleryShape,
		slug: item.slug,
		stack: item.tech,
		title: item.title,
		when: item.when,
	};
};

/* projects without a case live on stormej.me */
const ARCHIVE: WorkEntry[] = PROJECTS.filter(
	(project) => !caseFor(project.slug)
).map((project) => ({
	detail: project.summary,
	external: true,
	href: project.href,
	kind: "archive",
	metric: String(project.year),
	metricLabel: project.stack.join(" · "),
	shape: "phone",
	slug: project.slug,
	stack: project.stack,
	title: project.title,
	when: String(project.year),
}));

export const WORK_GROUPS = [
	{
		entries: WORK_CASES.map(fromCase),
		id: "team",
		label: "with teams",
		text: "startups i joined and built with, newest first.",
		title: "with teams",
	},
	{
		entries: PROJECT_CASES.map(fromCase),
		id: "own",
		label: "own products",
		text: "things i made because i wanted them to exist.",
		title: "my own products",
	},
	{
		entries: ARCHIVE,
		id: "archive",
		label: "archive",
		text: "older and smaller things. these open on stormej.me.",
		title: "the archive",
	},
] as const;

export type GroupId = (typeof WORK_GROUPS)[number]["id"];

const firstYear = WORK.at(-1)?.start.slice(0, 4) ?? "";

export const WORK_PAGE = {
	facts: [
		`${WORK_CASES.length} with teams`,
		`${PROJECT_CASES.length} own products`,
		`${ARCHIVE.length} in the archive`,
		`since ${firstYear}`,
	],
	text: `${inWords(WORK_CASES.length)} teams i've built with, ${inWords(PROJECT_CASES.length)} things i made for myself, and the older experiments that still live on stormej.me.`,
	title: "the work",
};

/** where a case sits in its own list, for "02 / 06" */
export const casePosition = (item: Case) => {
	const list = item.kind === "work" ? WORK_CASES : PROJECT_CASES;
	return { index: list.indexOf(item) + 1, total: list.length };
};

export const kindLabel = (item: Case) =>
	item.kind === "work" ? "with teams" : "own product";

/** "burrow/overview.webp" → "overview"; phone shots have no useful name */
export const screenName = (src: string, title: string) => {
	const name = src.split("/").pop()?.replace(".webp", "") ?? "";
	return name.includes("_") || name === title ? "" : name.replace("-", " ");
};

export const ALL_CASES = CASES;

/* ---------- writing ---------- */

const year = (iso: string) => iso.slice(0, 4);

/** "2026-04-28" → "apr 28" */
export const dayMonth = (iso: string) => {
	const [, , day] = iso.split("-");
	const [month] = monthYear(iso.slice(0, 7)).split(" ");
	return `${month} ${Number(day)}`;
};

export const POSTS_BY_YEAR = WRITING.reduce<
	{ posts: typeof WRITING; year: string }[]
>((groups, post) => {
	const last = groups.at(-1);
	if (last && last.year === year(post.date)) {
		last.posts.push(post);
	} else {
		groups.push({ posts: [post], year: year(post.date) });
	}
	return groups;
}, []);

export const WRITING_PAGE: { facts: string[]; text: string; title: string } = {
	facts: [
		`${WRITING.length} posts`,
		`${REELS.length} instagram posts`,
		`${REELS.filter((reel) => reel.video).length} with sound, here`,
	],
	text: "long-form lives on stormej.me. short-form lives on instagram, as @stormej.studio.",
	title: "notes",
};

/* ---------- about ---------- */

export const ABOUT_STACK = STACK;

export const span = (start: string, end: string | null) =>
	`${monthYear(start)} → ${end ? monthYear(end) : "now"}`;

/** the jobs that have a case page here */
export const hasCase = (slug: string) => Boolean(caseFor(slug));
