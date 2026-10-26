/* everything the orbit shows. hand-picked from apps/web/content so this
   experiment stays standalone. work and build open their own pages here;
   posts still point back at the live site */

import { withBase } from "@/lib/base";
import {
	LINKS,
	PERSON,
	PORTRAITS,
	STATS as PROFILE_STATS,
	SITE,
	yearsShipping,
} from "@/lib/profile";

export const CAL = LINKS.cal;
export const EMAIL = PERSON.email;

/** every page orbit has, without the base path (next/link adds it) */
export const ROUTES = {
	about: "/orbit/about",
	build: "/orbit/build",
	contact: "/orbit/contact",
	home: "/orbit",
	work: "/orbit/work",
	write: "/orbit/write",
} as const;

export type WorldId = "work" | "build" | "write";

export interface World {
	color: string;
	href: string;
	id: WorldId;
	label: string;
	/** the clause from the home's sentence this world answers */
	line: { before: string; word: string };
	/** text colour on top of `color` */
	on: string;
	/** the page title, as on stormej.me */
	title: string;
}

export const WORLDS: Record<WorldId, World> = {
	build: {
		color: "#c8553d",
		href: ROUTES.build,
		id: "build",
		label: "build",
		line: { before: "side projects for", word: "fun" },
		on: "#ffffff",
		title: "build: side projects",
	},
	work: {
		color: "#3d6a4c",
		href: ROUTES.work,
		id: "work",
		label: "work",
		line: { before: "products for", word: "startups" },
		on: "#ffffff",
		title: "work: products for startups",
	},
	write: {
		color: "#e3ac3a",
		href: ROUTES.write,
		id: "write",
		label: "write",
		line: { before: "write-ups for", word: "developers" },
		on: "#1a1d1a",
		title: "write: notes for developers",
	},
};

export const WORLD_ORDER: WorldId[] = ["work", "build", "write"];

/** the pages that aren't a world: about, contact, the ring itself */
export const PERSONAL = { color: "#1a1d1a", label: "about", on: "#f5f6f2" };

export type CardWorld = WorldId | "about";

export const toneFor = (world: CardWorld) =>
	world === "about" ? PERSONAL : WORLDS[world];

/** which world a path belongs to, if any */
export const worldOfPath = (path: string): WorldId | null =>
	WORLD_ORDER.find(
		(id) => path === WORLDS[id].href || path.startsWith(`${WORLDS[id].href}/`)
	) ?? null;

/** a case's page: jobs live under work, projects under build */
export const caseHref = (item: { kind: "work" | "project"; slug: string }) =>
	`${item.kind === "work" ? ROUTES.work : ROUTES.build}/${item.slug}`;

/** leaves orbit: another site, not a page or an anchor here */
export const isExternal = (href: string) =>
	href.startsWith("http") || href.startsWith("mailto:");

interface CardBase {
	href: string;
	id: string;
	/** small pill on the face: a year, a stack, a date */
	tag: string;
	title: string;
	world: CardWorld;
}

/** a portrait screenshot that fills the card */
interface ShotCard extends CardBase {
	image: string;
	kind: "shot";
}

/** a landscape clip, letterboxed on a tinted card */
interface ClipCard extends CardBase {
	image: string;
	kind: "clip";
	video: string;
}

/** a portrait clip that fills the card */
interface ReelCard extends CardBase {
	image: string;
	kind: "reel";
	video: string;
}

/** no media: set in type on the world colour */
interface TypeCard extends CardBase {
	kicker: string;
	kind: "type";
}

export type Card = ShotCard | ClipCard | ReelCard | TypeCard;

/* interleaved so the colours spread round the ring */
export const CARDS: Card[] = [
	{
		href: `${ROUTES.work}/digital-domi`,
		id: "domi",
		image: withBase("/media/domi-mail.webp"),
		kind: "shot",
		tag: "2024–26",
		title: "digital domi",
		world: "work",
	},
	{
		href: `${ROUTES.build}/lumen`,
		id: "lumen",
		image: withBase("/media/lumen.webp"),
		kind: "reel",
		tag: "flutter · ble",
		title: "lumen",
		video: withBase("/media/lumen.mp4"),
		world: "build",
	},
	{
		href: `${SITE}/blog/mobile-ar-recorder-end-to-end`,
		id: "ar-recorder",
		kicker: "apr 2026",
		kind: "type",
		tag: "essay",
		title: "what we learned building a mobile ar recorder end-to-end",
		world: "write",
	},
	{
		href: `${ROUTES.work}/merlin`,
		id: "merlin",
		image: withBase("/media/merlin-tools.webp"),
		kind: "shot",
		tag: "2024",
		title: "merlin ai",
		world: "work",
	},
	{
		href: `${ROUTES.build}/turi`,
		id: "turi",
		image: withBase("/media/turi-vad.webp"),
		kind: "shot",
		tag: "voice · email",
		title: "turi",
		world: "build",
	},
	{
		href: ROUTES.about,
		id: "shimla",
		image: PORTRAITS.shimla.src,
		kind: "shot",
		tag: PORTRAITS.shimla.place,
		title: "hi, i'm ekaksh",
		world: "about",
	},
	{
		href: `${ROUTES.work}/fpv-labs`,
		id: "fpv",
		image: withBase("/media/fpv-home.webp"),
		kind: "shot",
		tag: "2025–26",
		title: "fpv labs",
		world: "work",
	},
	{
		href: `${SITE}/blog/large-file-upload-system-flutter`,
		id: "uploads",
		kicker: "mar 2026",
		kind: "type",
		tag: "guide",
		title: "what i learned making large uploads reliable in flutter",
		world: "write",
	},
	{
		href: `${ROUTES.build}/aarthiqai`,
		id: "aarthiq",
		image: withBase("/media/aarthiq.webp"),
		kind: "clip",
		tag: "chat · voice",
		title: "aarthiq",
		video: withBase("/media/aarthiq.mp4"),
		world: "build",
	},
	{
		href: `${ROUTES.work}/zuai`,
		id: "zuai",
		image: withBase("/media/professor-curious.webp"),
		kind: "shot",
		tag: "2021",
		title: "professor curious",
		world: "work",
	},
	{
		href: `${ROUTES.work}/bullzeye`,
		id: "bullzeye",
		kicker: "founding engineer",
		kind: "type",
		tag: "now",
		title: "spatial capture on iphone lidar",
		world: "work",
	},
	{
		href: `${ROUTES.build}/burrow`,
		id: "burrow",
		image: withBase("/media/burrow.webp"),
		kind: "clip",
		tag: "swift · mac",
		title: "burrow",
		video: withBase("/media/burrow.mp4"),
		world: "build",
	},
	{
		href: `${ROUTES.work}/merlin`,
		id: "wallflower",
		image: withBase("/media/wallflower.webp"),
		kind: "shot",
		tag: "2024",
		title: "wallflower",
		world: "work",
	},
	{
		href: `${SITE}/blog/flutter-dark-light-mode-valuenotifier`,
		id: "dark-mode",
		kicker: "nov 2025",
		kind: "type",
		tag: "flutter",
		title: "the cleanest way to do dark/light mode in flutter",
		world: "write",
	},
	{
		href: ROUTES.about,
		id: "elevator",
		image: PORTRAITS.elevator.src,
		kind: "shot",
		tag: PORTRAITS.elevator.place,
		title: "about me",
		world: "about",
	},
	{
		href: `${ROUTES.build}/better-auth-flutter`,
		id: "better-auth",
		kicker: "open source",
		kind: "type",
		tag: "pub.dev",
		title: "better-auth, for flutter",
		world: "build",
	},
	{
		href: `${ROUTES.work}/team-black-box`,
		id: "tbb",
		kicker: "team black box",
		kind: "type",
		tag: "2023",
		title: "ui, nlp and polygons",
		world: "work",
	},
	{
		href: `${ROUTES.work}/fpv-labs`,
		id: "fpv-recording",
		image: withBase("/media/fpv-recording.webp"),
		kind: "shot",
		tag: "ar · depth",
		title: "stera capture",
		world: "work",
	},
];

export const cardById = (id: string) => CARDS.find((card) => card.id === id);

/** every image the loader waits on before the ring flies in */
export const PRELOAD: string[] = CARDS.flatMap((card) =>
	card.kind === "type" ? [] : [card.image]
);

export const STATS = [
	{ label: "startups", value: String(PROFILE_STATS.startups) },
	{ label: "projects", value: String(PROFILE_STATS.projects) },
	{ label: "years shipping", value: String(yearsShipping()) },
] as const;
