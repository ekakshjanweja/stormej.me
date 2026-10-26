/* the facts every experiment draws on, copied from apps/web/content and
   the stormej.studio instagram so the lab stays standalone. links point at
   the live site; media paths already carry the base path */

import { withBase } from "./base";

export const SITE = "https://www.stormej.me";
export const INSTAGRAM = "https://www.instagram.com/stormej.studio/";

export const PERSON = {
	email: "jekaksh@gmail.com",
	first: "ekaksh",
	last: "janweja",
	location: "delhi, india",
	name: "ekaksh janweja",
	role: "early-stage engineer",
	subline:
		"i work across product and engineering to turn messy ideas into fast, polished software that people actually use.",
	tagline: "early-stage engineer building products from idea to production.",
	/** used for the local clock */
	timeZone: "Asia/Kolkata",
} as const;

export const LINKS = {
	cal: "https://cal.com/ekaksh-janweja-pfvauh",
	github: "https://github.com/ekakshjanweja",
	instagram: INSTAGRAM,
	linkedin: "https://www.linkedin.com/in/ekakshjanweja/",
	resume: `${SITE}/files/resume.pdf`,
	site: SITE,
	threads: "https://www.threads.com/@stormej.studio",
	x: "https://x.com/ekaksh_janweja",
} as const;

export const SOCIALS = [
	{ href: LINKS.github, label: "github" },
	{ href: LINKS.instagram, label: "instagram" },
	{ href: LINKS.x, label: "x" },
	{ href: LINKS.linkedin, label: "linkedin" },
] as const;

export interface Job {
	company: string;
	end: string | null;
	href: string;
	/** a portrait screenshot from the app, if there is one */
	image?: string;
	role: string;
	slug: string;
	start: string;
	summary: string;
	tech: string[];
}

/* newest first, as on stormej.me/work */
export const WORK: Job[] = [
	{
		company: "bullzeye",
		end: null,
		href: `${SITE}/work/bullzeye`,
		role: "founding engineer",
		slug: "bullzeye",
		start: "2026-09",
		summary:
			"spatial capture and geometry on iphone lidar. depth, alignment and confidence for physical-world apps.",
		tech: ["ios", "lidar", "arkit", "on-device"],
	},
	{
		company: "fpv labs",
		end: "2026-08",
		href: `${SITE}/work/fpv-labs`,
		image: withBase("/media/fpv-home.webp"),
		role: "mobile engineer",
		slug: "fpv-labs",
		start: "2025-11",
		summary:
			"built the flutter capture app on arkit and arcore, and the multipart upload pipeline that gets field data off the phone.",
		tech: ["flutter", "arkit", "arcore", "uploads"],
	},
	{
		company: "digital domi",
		end: "2026-06",
		href: `${SITE}/work/digital-domi`,
		image: withBase("/media/domi-mail.webp"),
		role: "founding mobile engineer",
		slug: "digital-domi",
		start: "2024-10",
		summary:
			"first mobile hire. built the flutter app for digital mailboxes from zero: features, bugs and everything in between.",
		tech: ["flutter", "dart"],
	},
	{
		company: "merlin ai",
		end: "2024-10",
		href: `${SITE}/work/merlin`,
		image: withBase("/media/merlin-tools.webp"),
		role: "mobile intern",
		slug: "merlin",
		start: "2024-05",
		summary:
			"flutter at merlin and wallflower. new features, tighter ux, better dev workflows.",
		tech: ["flutter", "firebase", "kotlin", "jetpack glance"],
	},
	{
		company: "team black box",
		end: "2023-06",
		href: `${SITE}/work/team-black-box`,
		role: "mobile intern",
		slug: "team-black-box",
		start: "2023-01",
		summary:
			"six months across ui, nlp and geo features. first custom ui, first skia.",
		tech: ["react native", "skia", "firebase"],
	},
	{
		company: "professor curious",
		end: "2022-01",
		href: `${SITE}/work/zuai`,
		image: withBase("/media/professor-curious.webp"),
		role: "flutter intern",
		slug: "zuai",
		start: "2021-10",
		summary:
			"first internship, first real codebase. shipped features on a flutter app with 500k+ users.",
		tech: ["flutter", "firebase"],
	},
];

export interface Project {
	/** archived projects are older, smaller, or no longer running */
	archived?: boolean;
	/** the full film, with sound, that the short loop opens into */
	film?: string;
	href: string;
	/** a still, and a short muted loop if there is one */
	image?: string;
	/** "portrait" (9:16-ish phone) or "landscape" (16:9) */
	orientation?: "portrait" | "landscape";
	/** stills to show where there's no clip, with their pixel sizes */
	shots?: { alt: string; height: number; src: string; width: number }[];
	slug: string;
	stack: string[];
	summary: string;
	title: string;
	video?: string;
	year: number;
}

/* in the order stormej.me/projects lists them */
export const PROJECTS: Project[] = [
	{
		href: `${SITE}/projects/lumen`,
		image: withBase("/media/lumen.webp"),
		orientation: "portrait",
		slug: "lumen",
		stack: ["flutter", "ble", "kotlin", "swift"],
		summary: "a better remote for bluetooth led lights. reverse engineered.",
		title: "lumen",
		video: withBase("/media/lumen.mp4"),
		year: 2026,
	},
	{
		film: "https://burrow.ekaksh.in/launch.mp4",
		href: `${SITE}/projects/burrow`,
		image: withBase("/media/burrow.webp"),
		orientation: "landscape",
		slug: "burrow",
		stack: ["swift", "swiftui", "appkit", "ssh"],
		summary:
			"a tiny native mac app for developers. clean, understand, back up.",
		title: "burrow",
		video: withBase("/media/burrow.mp4"),
		year: 2026,
	},
	{
		film: `${SITE}/videos/aarthiq/demo.mp4`,
		href: `${SITE}/projects/aarthiqai`,
		image: withBase("/media/aarthiq.webp"),
		orientation: "landscape",
		slug: "aarthiqai",
		stack: ["tanstack start", "hono", "workers", "pipecat"],
		summary: "plan a home loan by chatting or talking to an ai advisor.",
		title: "aarthiq",
		video: withBase("/media/aarthiq.mp4"),
		year: 2026,
	},
	{
		href: `${SITE}/projects/turi`,
		image: withBase("/media/turi-vad.webp"),
		orientation: "portrait",
		shots: [
			{
				alt: "turi's voice activity detection, as a flowchart",
				height: 1338,
				src: withBase("/media/cases/turi/vad.webp"),
				width: 720,
			},
			{
				alt: "turi's agent workflow, as a flowchart",
				height: 756,
				src: withBase("/media/cases/turi/agent-workflow.webp"),
				width: 720,
			},
		],
		slug: "turi",
		stack: ["flutter", "bun", "hono", "ai sdk"],
		summary: "a voice-first email client. ai reads and sends your mail.",
		title: "turi",
		year: 2025,
	},
	{
		href: `${SITE}/projects/better-auth-flutter`,
		slug: "better-auth-flutter",
		stack: ["flutter", "dart"],
		summary: "the flutter client for better-auth, on pub.dev.",
		title: "better-auth-flutter",
		year: 2025,
	},
	{
		archived: true,
		href: `${SITE}/projects/browser-automation`,
		slug: "browser-automation",
		stack: ["ai sdk", "playwright", "bun"],
		summary: "a browser automation agent.",
		title: "browser-automation",
		year: 2025,
	},
	{
		archived: true,
		href: `${SITE}/projects/flux`,
		slug: "flux",
		stack: ["nextjs", "liveblocks", "convex"],
		summary: "a real-time visual workspace. drag, drop, sync.",
		title: "flux",
		year: 2024,
	},
	{
		archived: true,
		href: `${SITE}/projects/stormejislive`,
		slug: "stormejislive",
		stack: ["nextjs", "livekit", "postgres"],
		summary: "a twitch-style live stream with real-time chat.",
		title: "stormejislive",
		year: 2024,
	},
	{
		archived: true,
		href: `${SITE}/projects/dtusocial`,
		slug: "dtusocial",
		stack: ["flutter", "firebase", "riverpod"],
		summary: "proximity chat for college students.",
		title: "dtusocial",
		year: 2023,
	},
	{
		archived: true,
		href: `${SITE}/projects/gdocs`,
		slug: "gdocs",
		stack: ["flutter", "socket.io", "mongodb"],
		summary: "a google docs clone with real-time collab.",
		title: "gdocs",
		year: 2023,
	},
	{
		href: `${SITE}/projects/old-portfolio`,
		slug: "old-portfolio",
		stack: ["flutter web"],
		summary: "my old portfolio, in flutter web.",
		title: "old portfolio",
		year: 2022,
	},
];

export interface Post {
	date: string;
	href: string;
	summary: string;
	title: string;
}

export const WRITING: Post[] = [
	{
		date: "2026-04-28",
		href: `${SITE}/blog/mobile-ar-recorder-end-to-end`,
		summary:
			"a cross-platform ar recording pipeline with deterministic sampling, mcap serialization and reliable multipart uploads.",
		title: "what we learned building a mobile ar recorder end-to-end",
	},
	{
		date: "2026-03-11",
		href: `${SITE}/blog/large-file-upload-system-flutter`,
		summary:
			"flaky networks, background execution and resumable uploads, made reliable.",
		title: "what i learned making large uploads reliable in flutter",
	},
	{
		date: "2025-11-22",
		href: `${SITE}/blog/flutter-dark-light-mode-valuenotifier`,
		summary: "dark and light themes with nothing but a valuenotifier.",
		title: "the cleanest way to do dark/light mode in flutter",
	},
	{
		date: "2023-09-30",
		href: `${SITE}/blog/sih-23`,
		summary: "govbuzz, and a hackathon that didn't go to plan.",
		title: "sih'23",
	},
	{
		date: "2023-08-10",
		href: `${SITE}/blog/dtu-social`,
		summary: "how dtu.social got built.",
		title: "dtu.social",
	},
	{
		date: "2023-07-02",
		href: `${SITE}/blog/tbb-internship-exp`,
		summary: "six months at team black box.",
		title: "team black box internship",
	},
];

export interface Reel {
	/** a webvtt track for the saved reels: the soundtrack and the on-screen line */
	captions?: string;
	/** the cover, 720px wide */
	cover: string;
	date: string;
	href: string;
	/** 9:16 reel or 4:5 carousel */
	kind: "reel" | "carousel";
	/** the caption's first line, cleaned up */
	title: string;
	/** the reel itself, with its audio, 540px wide */
	video?: string;
}

/* the reels saved locally, so they can play (with sound) in the page */
const SAVED = new Set([
	"De695u9iGL5",
	"DefFgUrC4Si",
	"DejyibXiKjs",
	"DerCwzLCNFR",
	"DewVeY2ixQP",
]);

const reel = (
	code: string,
	kind: Reel["kind"],
	date: string,
	title: string
): Reel => ({
	captions: SAVED.has(code) ? withBase(`/media/reels/${code}.vtt`) : undefined,
	cover: withBase(`/media/ig/${code}.webp`),
	date,
	href: `${INSTAGRAM}${kind === "reel" ? "reel" : "p"}/${code}/`,
	kind,
	title,
	video: SAVED.has(code) ? withBase(`/media/reels/${code}.mp4`) : undefined,
});

/* stormej.studio, newest first */
export const REELS: Reel[] = [
	reel("De695u9iGL5", "reel", "2026-10-25", "the desk is never done"),
	reel("DewVeY2ixQP", "reel", "2026-10-21", "same code. better coffee."),
	reel("DerCwzLCNFR", "reel", "2026-10-19", "this is dwarka"),
	reel("DejyibXiKjs", "reel", "2026-10-16", "one green square at a time"),
	reel("DefFgUrC4Si", "reel", "2026-10-14", "walk → code → repeat"),
	reel(
		"DedqYEJEdu_",
		"carousel",
		"2026-10-13",
		"judging ai agents beyond the model"
	),
	reel("DeXN1v_zjYM", "reel", "2026-10-11", "built umber"),
	reel(
		"DeQ1DsrkX1w",
		"carousel",
		"2026-10-08",
		"voice agents are only as fast as their slowest step"
	),
	reel("DeHOcTjk2QX", "carousel", "2026-10-05", "software i use daily"),
	reel(
		"DeDphjlkWsJ",
		"carousel",
		"2026-10-03",
		"things i made with ai this week"
	),
	reel("Dd_bwtLTudN", "reel", "2026-10-02", "shipping from the phone"),
	reel("Dd1pV5nzPUQ", "reel", "2026-09-28", "so i built burrow"),
];

/** the reels that can play here, newest first */
export const PLAYABLE_REELS = REELS.filter(
	(item): item is Reel & { video: string } => item.video !== undefined
);

export const STACK = [
	"flutter",
	"dart",
	"swift",
	"typescript",
	"react",
	"next.js",
	"hono",
	"cloudflare workers",
	"ai sdk",
	"arkit",
] as const;

const MONTHS_PER_YEAR = 12;

/** "2024-10" → a running month number, so months can be counted and merged */
const monthIndex = (iso: string) => {
	const [year = 0, month = 1] = iso.split("-").map(Number);
	return year * MONTHS_PER_YEAR + (month - 1);
};

/** the months actually spent in a job, counted once even where two jobs
    overlapped (as stormej.me counts them). a job still going runs to this
    month */
export const monthsWorked = (now: Date = new Date()) => {
	const thisMonth = now.getFullYear() * MONTHS_PER_YEAR + now.getMonth();
	const months = new Set<number>();
	for (const job of WORK) {
		const last = job.end ? monthIndex(job.end) : thisMonth;
		for (let month = monthIndex(job.start); month <= last; month += 1) {
			months.add(month);
		}
	}
	return months.size;
};

/** worked out at build time; the pages are static */
export const yearsShipping = () => Math.round(monthsWorked() / MONTHS_PER_YEAR);

export const STATS = {
	contributions2025: 3509,
	projects: PROJECTS.length,
	startups: WORK.length,
} as const;

/** "2024-10" → "oct 2024" */
export const monthYear = (iso: string) => {
	const [year, month] = iso.split("-").map(Number);
	const names = [
		"jan",
		"feb",
		"mar",
		"apr",
		"may",
		"jun",
		"jul",
		"aug",
		"sep",
		"oct",
		"nov",
		"dec",
	];
	return `${names[(month ?? 1) - 1]} ${year}`;
};

export interface Portrait {
	alt: string;
	height: number;
	/** where it was taken, lowercase, for captions */
	place: string;
	src: string;
	width: number;
}

/* a few photos of me, graded dark and cinematic to sit with the sage paper */
export const PORTRAITS = {
	elevator: {
		alt: "ekaksh taking a mirror selfie in a steel elevator, laptop open in one hand and a green tote bag on his arm",
		height: 1440,
		place: "between floors",
		src: withBase("/media/portraits/elevator.webp"),
		width: 1080,
	},
	rooftop: {
		alt: "ekaksh smiling on a rooftop in glasses and a dark t-shirt, apartment blocks behind him under a grey sky",
		height: 538,
		place: "dwarka, delhi",
		src: withBase("/media/portraits/rooftop.webp"),
		width: 538,
	},
	shimla: {
		alt: "ekaksh leaning on a railing above red tin roofs in shimla, hills and heavy clouds behind him",
		height: 1440,
		place: "shimla",
		src: withBase("/media/portraits/shimla.webp"),
		width: 1080,
	},
} as const satisfies Record<string, Portrait>;

/* a short clip from the gym, with its own sound. only the archived
   experiments still show it; the strip doesn't */
export const GYM_CLIP = {
	alt: "ekaksh pressing a pair of dumbbells on a bench at night, a rack of weights and city lights behind him",
	captions: withBase("/media/portraits/gym.vtt"),
	height: 958,
	poster: withBase("/media/portraits/gym.webp"),
	src: withBase("/media/portraits/gym.mp4"),
	title: "the other kind of reps",
	width: 540,
} as const;
