/**
 * The site design: every knob the vault's design studio can turn.
 *
 * A design is plain JSON (`DesignConfig`). It is published to the worker,
 * rendered server side as `data-*` attributes plus a generated <style> (see
 * ./css.ts), and styled by app/design.css. The first option of every list is
 * the site as it shipped before the studio existed.
 */

// ─── fonts ──────────────────────────────────────────────────────────────

interface FontMetrics {
	tracking: string;
	weight: number;
}

export interface FontOption {
	/** how the font sits when used for headlines */
	display: FontMetrics;
	fallback: string;
	id: string;
	label: string;
	/** how the font sits when used for the hero lede */
	lede: FontMetrics;
	/** next/font css variable, see app/fonts.ts */
	variable: string;
}

const SANS = "ui-sans-serif, system-ui, sans-serif";
const SERIF = "ui-serif, Georgia, serif";
const MONO = "ui-monospace, SFMono-Regular, monospace";

export const FONTS = [
	{
		display: { tracking: "-0.035em", weight: 600 },
		fallback: SANS,
		id: "geist",
		label: "Geist",
		lede: { tracking: "-0.01em", weight: 400 },
		variable: "--font-geist-sans",
	},
	{
		display: { tracking: "-0.01em", weight: 400 },
		fallback: SERIF,
		id: "instrument-serif",
		label: "Instrument Serif",
		lede: { tracking: "-0.005em", weight: 400 },
		variable: "--font-instrument-serif",
	},
	{
		display: { tracking: "-0.01em", weight: 500 },
		fallback: SERIF,
		id: "garamond",
		label: "EB Garamond",
		lede: { tracking: "0em", weight: 400 },
		variable: "--font-garamond",
	},
	{
		display: { tracking: "-0.02em", weight: 600 },
		fallback: SERIF,
		id: "fraunces",
		label: "Fraunces",
		lede: { tracking: "-0.01em", weight: 400 },
		variable: "--font-fraunces",
	},
	{
		display: { tracking: "-0.02em", weight: 700 },
		fallback: SERIF,
		id: "playfair",
		label: "Playfair Display",
		lede: { tracking: "-0.01em", weight: 400 },
		variable: "--font-playfair",
	},
	{
		display: { tracking: "-0.015em", weight: 400 },
		fallback: SERIF,
		id: "dm-serif",
		label: "DM Serif Display",
		lede: { tracking: "-0.01em", weight: 400 },
		variable: "--font-dm-serif",
	},
	{
		display: { tracking: "-0.015em", weight: 500 },
		fallback: SERIF,
		id: "newsreader",
		label: "Newsreader",
		lede: { tracking: "-0.005em", weight: 400 },
		variable: "--font-newsreader",
	},
	{
		display: { tracking: "-0.03em", weight: 600 },
		fallback: SANS,
		id: "space-grotesk",
		label: "Space Grotesk",
		lede: { tracking: "-0.02em", weight: 400 },
		variable: "--font-space-grotesk",
	},
	{
		display: { tracking: "-0.035em", weight: 700 },
		fallback: SANS,
		id: "bricolage",
		label: "Bricolage Grotesque",
		lede: { tracking: "-0.02em", weight: 500 },
		variable: "--font-bricolage",
	},
	{
		display: { tracking: "-0.02em", weight: 800 },
		fallback: SANS,
		id: "syne",
		label: "Syne",
		lede: { tracking: "-0.01em", weight: 500 },
		variable: "--font-syne",
	},
	{
		display: { tracking: "-0.02em", weight: 700 },
		fallback: SANS,
		id: "unbounded",
		label: "Unbounded",
		lede: { tracking: "-0.02em", weight: 400 },
		variable: "--font-unbounded",
	},
	{
		display: { tracking: "-0.02em", weight: 400 },
		fallback: SANS,
		id: "archivo-black",
		label: "Archivo Black",
		lede: { tracking: "-0.015em", weight: 400 },
		variable: "--font-archivo-black",
	},
	{
		display: { tracking: "-0.02em", weight: 700 },
		fallback: MONO,
		id: "space-mono",
		label: "Space Mono",
		lede: { tracking: "-0.02em", weight: 400 },
		variable: "--font-space-mono",
	},
	{
		display: { tracking: "-0.03em", weight: 600 },
		fallback: MONO,
		id: "geist-mono",
		label: "Geist Mono",
		lede: { tracking: "-0.02em", weight: 400 },
		variable: "--font-geist-mono",
	},
	{
		display: { tracking: "-0.03em", weight: 700 },
		fallback: MONO,
		id: "jetbrains",
		label: "JetBrains Mono",
		lede: { tracking: "-0.02em", weight: 400 },
		variable: "--font-jetbrains",
	},
	{
		display: { tracking: "-0.02em", weight: 600 },
		fallback: MONO,
		id: "plex-mono",
		label: "IBM Plex Mono",
		lede: { tracking: "-0.015em", weight: 400 },
		variable: "--font-plex-mono",
	},
	{
		display: { tracking: "0em", weight: 400 },
		fallback: MONO,
		id: "vt323",
		label: "VT323",
		lede: { tracking: "0em", weight: 400 },
		variable: "--font-vt323",
	},
	{
		display: { tracking: "0.02em", weight: 500 },
		fallback: MONO,
		id: "handjet",
		label: "Handjet",
		lede: { tracking: "0.01em", weight: 400 },
		variable: "--font-handjet",
	},
] as const satisfies readonly FontOption[];

export type FontId = (typeof FONTS)[number]["id"];

export const FONT_PAIRINGS: {
	body: FontId;
	display: FontId;
	id: string;
	label: string;
	label_font: FontId;
	lede: LedeFont;
}[] = [
	{
		body: "geist",
		display: "instrument-serif",
		id: "editorial",
		label: "editorial",
		label_font: "space-mono",
		lede: "body",
	},
	{
		body: "garamond",
		display: "instrument-serif",
		id: "bookish",
		label: "bookish",
		label_font: "garamond",
		lede: "display",
	},
	{
		body: "geist-mono",
		display: "space-mono",
		id: "terminal",
		label: "terminal",
		label_font: "space-mono",
		lede: "display",
	},
	{
		body: "geist",
		display: "geist",
		id: "grotesk",
		label: "grotesk",
		label_font: "geist-mono",
		lede: "body",
	},
	{
		body: "newsreader",
		display: "playfair",
		id: "quarterly",
		label: "quarterly",
		label_font: "plex-mono",
		lede: "display",
	},
	{
		body: "bricolage",
		display: "fraunces",
		id: "soft",
		label: "soft",
		label_font: "jetbrains",
		lede: "display",
	},
	{
		body: "space-grotesk",
		display: "unbounded",
		id: "poster",
		label: "poster",
		label_font: "space-mono",
		lede: "display",
	},
	{
		body: "geist-mono",
		display: "syne",
		id: "rave",
		label: "rave",
		label_font: "vt323",
		lede: "display",
	},
	{
		body: "space-grotesk",
		display: "archivo-black",
		id: "brutal",
		label: "brutal",
		label_font: "jetbrains",
		lede: "display",
	},
	{
		body: "geist-mono",
		display: "handjet",
		id: "pixel",
		label: "pixel",
		label_font: "vt323",
		lede: "display",
	},
];

// ─── palettes ───────────────────────────────────────────────────────────

/** six hand-picked colours per mode; everything else is derived in css.ts */
export interface PaletteTokens {
	accent: string;
	background: string;
	border: string;
	foreground: string;
	muted: string;
	surface: string;
}

export interface PaletteModes {
	dark: PaletteTokens;
	light: PaletteTokens;
}

export const PALETTE_TOKEN_KEYS = [
	"background",
	"foreground",
	"surface",
	"muted",
	"border",
	"accent",
] as const satisfies readonly (keyof PaletteTokens)[];

export const PALETTE_TOKEN_LABELS: Record<keyof PaletteTokens, string> = {
	accent: "accent",
	background: "background",
	border: "lines",
	foreground: "text",
	muted: "quiet text",
	surface: "surface",
};

const tokens = (
	background: string,
	foreground: string,
	surface: string,
	muted: string,
	border: string,
	accent: string
): PaletteTokens => ({
	accent,
	background,
	border,
	foreground,
	muted,
	surface,
});

export const PALETTES = [
	{
		hint: "cool slate, violet / lime",
		id: "slate",
		label: "slate",
		modes: {
			dark: tokens(
				"#1a1d23",
				"#e2e5ea",
				"#2a2e36",
				"#9aa0ab",
				"#414752",
				"#d6f06a"
			),
			light: tokens(
				"#fbfcfe",
				"#2b303a",
				"#eef1f5",
				"#737b89",
				"#dfe3ea",
				"#7c2cf0"
			),
		},
	},
	{
		hint: "cream stock, terracotta",
		id: "paper",
		label: "paper",
		modes: {
			dark: tokens(
				"#211d19",
				"#ede6da",
				"#2f2a24",
				"#a89d8e",
				"#433c34",
				"#f0935c"
			),
			light: tokens(
				"#f8f4ec",
				"#3a3128",
				"#eee7da",
				"#7c6f60",
				"#e0d6c5",
				"#c0552e"
			),
		},
	},
	{
		hint: "pure greyscale, electric blue",
		id: "ink",
		label: "ink",
		modes: {
			dark: tokens(
				"#0b0b0b",
				"#f5f5f5",
				"#1c1c1c",
				"#9a9a9a",
				"#2e2e2e",
				"#6b8bff"
			),
			light: tokens(
				"#ffffff",
				"#111111",
				"#f4f4f4",
				"#666666",
				"#e3e3e3",
				"#1f4bff"
			),
		},
	},
	{
		hint: "muted greens",
		id: "sage",
		label: "sage",
		modes: {
			dark: tokens(
				"#161e19",
				"#e3ebe3",
				"#222c25",
				"#95a598",
				"#36433a",
				"#9fdc86"
			),
			light: tokens(
				"#f5f8f4",
				"#25372c",
				"#e8eee7",
				"#667a6d",
				"#d7e0d6",
				"#2f7d4f"
			),
		},
	},
	{
		hint: "plum night, amber",
		id: "dusk",
		label: "dusk",
		modes: {
			dark: tokens(
				"#15122a",
				"#ece6f4",
				"#221d3b",
				"#a79fbd",
				"#362e55",
				"#f5c16c"
			),
			light: tokens(
				"#faf7fc",
				"#33264a",
				"#efe9f5",
				"#7a6d8f",
				"#e2d9ec",
				"#c2327a"
			),
		},
	},
	{
		hint: "black and acid green",
		id: "acid",
		label: "acid",
		modes: {
			dark: tokens(
				"#0a0a0a",
				"#eaffd0",
				"#161a12",
				"#8d9a7c",
				"#2a3120",
				"#c6ff3d"
			),
			light: tokens(
				"#f2f2ea",
				"#0d0d0d",
				"#e4e4d8",
				"#5c5c52",
				"#cfcfc0",
				"#4f8a00"
			),
		},
	},
	{
		hint: "klein blue, yellow",
		id: "cobalt",
		label: "cobalt",
		modes: {
			dark: tokens(
				"#0f23b8",
				"#f4f6ff",
				"#1b31c9",
				"#b7c1ff",
				"#3b50d6",
				"#ffd23f"
			),
			light: tokens(
				"#f3f5ff",
				"#0a1a8c",
				"#e3e8ff",
				"#4a5bb0",
				"#c9d2ff",
				"#0033ff"
			),
		},
	},
	{
		hint: "riso pink and blue on cream",
		id: "riso",
		label: "riso",
		modes: {
			dark: tokens(
				"#1d1b3a",
				"#fbeee0",
				"#2a2750",
				"#a9a6d0",
				"#3d3a6b",
				"#ff6f91"
			),
			light: tokens(
				"#fdf6ec",
				"#2a2a6e",
				"#f6e9da",
				"#6b6aa0",
				"#ecd9c6",
				"#f0386b"
			),
		},
	},
	{
		hint: "charcoal and hot orange",
		id: "ember",
		label: "ember",
		modes: {
			dark: tokens(
				"#141110",
				"#f3ebe6",
				"#221c19",
				"#a39187",
				"#3a302b",
				"#ff7a2f"
			),
			light: tokens(
				"#fbf7f4",
				"#231a16",
				"#f1e9e3",
				"#7d6a60",
				"#e6d8cf",
				"#e8590c"
			),
		},
	},
	{
		hint: "blush and raspberry",
		id: "rose",
		label: "rose",
		modes: {
			dark: tokens(
				"#1f1216",
				"#fbe9ee",
				"#2e1b21",
				"#bf94a0",
				"#4a2c35",
				"#ff8fb1"
			),
			light: tokens(
				"#fff7f8",
				"#4a1f2b",
				"#fbe8ec",
				"#936270",
				"#f2d3db",
				"#d6336c"
			),
		},
	},
	{
		hint: "phosphor green crt",
		id: "phosphor",
		label: "phosphor",
		modes: {
			dark: tokens(
				"#050805",
				"#b7f7b7",
				"#0c140c",
				"#5f9a64",
				"#173017",
				"#39ff14"
			),
			light: tokens(
				"#f4fbf4",
				"#0f2a14",
				"#e4f3e4",
				"#4d7a55",
				"#c9e6cc",
				"#00a33c"
			),
		},
	},
] as const satisfies readonly {
	hint: string;
	id: string;
	label: string;
	modes: PaletteModes;
}[];

export type PaletteId = (typeof PALETTES)[number]["id"] | "custom";

// ─── structural axes ────────────────────────────────────────────────────

const option = <V extends string>(value: V, label: string, hint: string) => ({
	hint,
	label,
	value,
});

export const LAYOUTS = [
	option("column", "column", "single centred column"),
	option("split", "split", "sticky intro beside the feed"),
	option("compact", "compact", "narrow and dense"),
	option("bento", "bento", "homepage as a grid of cards"),
	option("magazine", "magazine", "poster-size intro, two-column feed"),
	option("sidebar", "sidebar", "navigation in a fixed left rail"),
	option("window", "window", "the whole site in an app window"),
	option("cover", "cover", "the intro fills the first screen"),
	option("ledger", "ledger", "every section a row, label on the left"),
	option("diptych", "diptych", "split screen, intro on a fixed dark half"),
	option("bands", "bands", "full-width stripes, one per section"),
	option("newspaper", "newspaper", "three ruled columns under a banner"),
	option(
		"blueprint",
		"blueprint",
		"rails and hatched dividers between sections"
	),
] as const;

export const NAVS = [
	option("classic", "classic", "name left, links right"),
	option("minimal", "minimal", "just your name and a way to reach you"),
	option("framed", "framed", "rails and hairlines around the bar"),
	option("links", "links first", "links on the left, fades out on scroll"),
	option("centered", "centred", "links in the middle, a button on the right"),
	option("island", "island", "floating pill at the top"),
	option("dock", "dock", "floating pill at the bottom"),
	option("masthead", "masthead", "big name, links underneath"),
	option("keys", "keys", "every link shows its keyboard shortcut"),
	option("corner", "corner", "one round button, a full-screen menu"),
	option("edges", "edges", "name and links pinned to the screen edges"),
] as const;

export const HEADINGS = [
	option("label", "label", "tracked mono caps"),
	option("numbered", "numbered", "01 — numbered"),
	option("serif", "serif", "large display italic"),
	option("rule", "rule", "label with a hairline"),
	option("bracket", "bracket", "[ work ]"),
	option("slash", "slash", "// work"),
	option("marker", "marker", "highlighter behind the label"),
	option("block", "block", "inverted tag"),
] as const;

export const LINKS = [
	option("squiggle", "squiggle", "wavy underline"),
	option("underline", "underline", "straight underline that draws in"),
	option("marker", "marker", "highlighter swipe"),
	option("invert", "invert", "text flips out of a solid block"),
	option("dotted", "dotted", "dotted underline"),
] as const;

export const TEXTURES = [
	option("none", "none", "flat"),
	option("grain", "grain", "film grain over everything"),
	option("grid", "grid", "graph paper"),
	option("dots", "dots", "dot matrix"),
	option("scanlines", "scanlines", "crt lines"),
] as const;

export const SHAPES = [
	option("soft", "soft", "gently rounded"),
	option("sharp", "sharp", "square corners"),
	option("round", "round", "extra round"),
	option("brutal", "brutal", "hard borders and offset shadows"),
] as const;

export const SCALES = [
	option("regular", "regular", "as designed"),
	option("small", "small", "quiet intro"),
	option("large", "large", "bigger intro"),
	option("huge", "huge", "poster intro"),
] as const;

export const LEDE_FONTS = [
	option("body", "body font", "intro set in the body font"),
	option("display", "display font", "intro set in the display font"),
] as const;

type ValueOf<T extends readonly { value: string }[]> = T[number]["value"];
type LedeFont = ValueOf<typeof LEDE_FONTS>;

export const STRUCTURE_AXES = [
	{ key: "nav", label: "navbar", options: NAVS },
	{ key: "layout", label: "layout", options: LAYOUTS },
	{ key: "heading", label: "headings", options: HEADINGS },
	{ key: "link", label: "links", options: LINKS },
	{ key: "texture", label: "texture", options: TEXTURES },
	{ key: "shape", label: "shape", options: SHAPES },
	{ key: "scale", label: "intro size", options: SCALES },
] as const;

export type StructureAxis = (typeof STRUCTURE_AXES)[number];
export type StructureKey = StructureAxis["key"];

// ─── hero copy ──────────────────────────────────────────────────────────

/** the words at the top of the homepage; rendered as text, never as html */
export interface HeroCopy {
	/** button to cal.com */
	cta: string;
	/** small caps line above the headline; empty hides it */
	eyebrow: string;
	headline: string;
	/** quieter second paragraph; empty hides it */
	subline: string;
}

export const COPY_FIELDS = [
	{ key: "eyebrow", label: "eyebrow", max: 60, multiline: false },
	{ key: "headline", label: "headline", max: 180, multiline: true },
	{ key: "subline", label: "subline", max: 320, multiline: true },
	{ key: "cta", label: "button", max: 32, multiline: false },
] as const satisfies readonly {
	key: keyof HeroCopy;
	label: string;
	max: number;
	multiline: boolean;
}[];

export const COPY_OPTIONS: { copy: HeroCopy; hint: string; id: string }[] = [
	{
		copy: {
			cta: "get in touch",
			eyebrow: "",
			headline:
				"mobile engineer building spatial computing and ai systems that work in the real world.",
			subline:
				"currently building spatial capture and geometry systems on iphone lidar for physical-world applications.",
		},
		hint: "what shipped before the studio",
		id: "original",
	},
	// short ones, written the way the blog and case studies read
	{
		copy: {
			cta: "get in touch",
			eyebrow: "",
			headline: "confidence, not hope.",
			subline:
				"mobile engineer building spatial capture on iphone lidar. if a scan isn't good enough, it says so.",
		},
		hint: "crisp: the bullzeye rule in three words",
		id: "not-hope",
	},
	{
		copy: {
			cta: "say hi",
			eyebrow: "mobile engineer",
			headline: "scan → geometry → decisions.",
			subline: "i build the part in between. iphone lidar, on device.",
		},
		hint: "crisp: the pipeline as an arrow chain",
		id: "arrows",
	},
	{
		copy: {
			cta: "get in touch",
			eyebrow: "",
			headline: "spatial capture isn't a camera problem. it's a trust problem.",
			subline: "i make phone scans good enough to build on.",
		},
		hint: "crisp: reframe, like the ar recorder post",
		id: "reframe",
	},
	{
		copy: {
			cta: "let's talk",
			eyebrow: "ekaksh · new delhi",
			headline: "shipping isn't finishing.",
			subline:
				"mobile engineer who stays for the loading, empty and error states. currently on iphone lidar.",
		},
		hint: "crisp: detail work compounds",
		id: "finishing",
	},
	{
		copy: {
			cta: "get in touch",
			eyebrow: "",
			headline: "robust over flashy.",
			subline:
				"mobile apps that measure the real world. iphone lidar, ar capture, uploads that survive a dead network.",
		},
		hint: "crisp: prefer the boring answer that works",
		id: "robust",
	},
	{
		copy: {
			cta: "say hi",
			eyebrow: "mobile · spatial · ai",
			headline:
				"i build the edge cases nobody asks about until something breaks.",
			subline:
				"spatial capture at bullzeye. before that, the recorder behind 200 hours of egocentric data.",
		},
		hint: "crisp: dry, a little self-aware",
		id: "edge-cases",
	},
	{
		copy: {
			cta: "get in touch",
			eyebrow: "",
			headline: "nothing downstream should have to guess.",
			subline:
				"spatial capture and geometry systems on iphone. confidence-gated, on device.",
		},
		hint: "crisp: one principle, one line of proof",
		id: "downstream",
	},
	{
		copy: {
			cta: "say hi",
			eyebrow: "ekaksh janweja · new delhi",
			headline: "i build mobile apps that understand the room they're in.",
			subline:
				"right now that means turning iphone lidar scans into geometry an app can trust. before that: ar capture at fpv labs and a mailbox app built from scratch at digital domi.",
		},
		hint: "plain words, one clear idea",
		id: "plain",
	},
	{
		copy: {
			cta: "get in touch",
			eyebrow: "mobile engineer",
			headline: "i make phones see in 3d.",
			subline:
				"lidar, depth and on-device geometry on iphone. shipping flutter and native apps to real people since 2021.",
		},
		hint: "short and loud",
		id: "punchy",
	},
	{
		copy: {
			cta: "work with me",
			eyebrow: "mobile engineer @ bullzeye",
			headline: "spatial capture, ar and ai products, end to end on mobile.",
			subline:
				"founding mobile engineer at digital domi, ar capture at fpv labs, and co-author of mobileego anywhere: 200 hours of egocentric data recorded on everyday phones.",
		},
		hint: "leads with the receipts",
		id: "proof",
	},
	{
		copy: {
			cta: "let's talk",
			eyebrow: "hello, नमस्ते",
			headline:
				"i'm ekaksh, a mobile engineer who sweats the details you feel but never notice.",
			subline:
				"these days i'm teaching iphones to measure the physical world. off the clock: valorant, mechanical keyboards and seedhe maut on repeat.",
		},
		hint: "a greeting and a bit of personality",
		id: "warm",
	},
	{
		copy: {
			cta: "contact",
			eyebrow: "",
			headline: "mobile engineer. spatial computing. ai.",
			subline: "currently: lidar capture and on-device geometry at bullzeye.",
		},
		hint: "three words and a status line",
		id: "terse",
	},
	{
		copy: {
			cta: "get in touch",
			eyebrow: "ios · android · lidar",
			headline:
				"from depth sensor to app store, i build the whole mobile stack.",
			subline:
				"capture, geometry, upload pipelines and the interface on top, in flutter, swift and arkit, shipped to real users on both platforms.",
		},
		hint: "full-stack mobile, top to bottom",
		id: "builder",
	},
];

export const DEFAULT_COPY: HeroCopy = COPY_OPTIONS[0]?.copy as HeroCopy;

export const matchCopyOption = (copy: HeroCopy) =>
	COPY_OPTIONS.find((candidate) =>
		COPY_FIELDS.every(({ key }) => candidate.copy[key] === copy[key])
	);

// ─── the config ─────────────────────────────────────────────────────────

export interface DesignConfig {
	copy: HeroCopy;
	/** only read when palette is "custom" */
	custom: PaletteModes;
	fontBody: FontId;
	fontDisplay: FontId;
	fontLabel: FontId;
	heading: ValueOf<typeof HEADINGS>;
	layout: ValueOf<typeof LAYOUTS>;
	lede: LedeFont;
	link: ValueOf<typeof LINKS>;
	nav: ValueOf<typeof NAVS>;
	palette: PaletteId;
	scale: ValueOf<typeof SCALES>;
	shape: ValueOf<typeof SHAPES>;
	texture: ValueOf<typeof TEXTURES>;
}

const SLATE = PALETTES[0].modes;

export const DEFAULT_DESIGN: DesignConfig = {
	copy: DEFAULT_COPY,
	custom: SLATE,
	fontBody: "geist",
	fontDisplay: "instrument-serif",
	fontLabel: "space-mono",
	heading: "label",
	layout: "column",
	lede: "body",
	link: "squiggle",
	nav: "classic",
	palette: "slate",
	scale: "regular",
	shape: "soft",
	texture: "none",
};

// ─── presets ────────────────────────────────────────────────────────────

type PresetConfig = Omit<
	DesignConfig,
	"copy" | "custom" | "fontBody" | "fontDisplay" | "fontLabel" | "lede" | "nav"
> & {
	fonts: (typeof FONT_PAIRINGS)[number]["id"];
	/** older presets predate the navbar axis and keep the classic bar */
	nav?: DesignConfig["nav"];
};

const RAW_PRESETS: {
	config: PresetConfig;
	description: string;
	id: string;
}[] = [
	{
		config: {
			fonts: "editorial",
			heading: "label",
			layout: "column",
			link: "squiggle",
			palette: "slate",
			scale: "regular",
			shape: "soft",
			texture: "none",
		},
		description: "what shipped before the studio",
		id: "current",
	},
	{
		config: {
			fonts: "bookish",
			heading: "serif",
			layout: "column",
			link: "underline",
			palette: "paper",
			scale: "regular",
			shape: "soft",
			texture: "grain",
		},
		description: "a printed quarterly",
		id: "press",
	},
	{
		config: {
			fonts: "terminal",
			heading: "slash",
			layout: "window",
			link: "marker",
			palette: "phosphor",
			scale: "regular",
			shape: "sharp",
			texture: "scanlines",
		},
		description: "a crt in a window",
		id: "terminal",
	},
	{
		config: {
			fonts: "grotesk",
			heading: "rule",
			layout: "split",
			link: "underline",
			palette: "ink",
			scale: "large",
			shape: "sharp",
			texture: "none",
		},
		description: "swiss grid, heavy sans, hairlines",
		id: "swiss",
	},
	{
		config: {
			fonts: "editorial",
			heading: "numbered",
			layout: "column",
			link: "squiggle",
			palette: "sage",
			scale: "regular",
			shape: "soft",
			texture: "dots",
		},
		description: "the original, grown some moss",
		id: "garden",
	},
	{
		config: {
			fonts: "bookish",
			heading: "serif",
			layout: "split",
			link: "marker",
			palette: "dusk",
			scale: "large",
			shape: "soft",
			texture: "grain",
		},
		description: "late-night reading room",
		id: "nocturne",
	},
	{
		config: {
			fonts: "brutal",
			heading: "block",
			layout: "bento",
			link: "invert",
			palette: "ink",
			scale: "large",
			shape: "brutal",
			texture: "grid",
		},
		description: "hard edges, offset shadows, cards",
		id: "brutalist",
	},
	{
		config: {
			fonts: "poster",
			heading: "bracket",
			layout: "magazine",
			link: "underline",
			palette: "cobalt",
			scale: "huge",
			shape: "sharp",
			texture: "none",
		},
		description: "klein blue gallery poster",
		id: "cobalt",
	},
	{
		config: {
			fonts: "soft",
			heading: "marker",
			layout: "bento",
			link: "marker",
			palette: "riso",
			scale: "large",
			shape: "round",
			texture: "grain",
		},
		description: "risograph zine, rounded cards",
		id: "zine",
	},
	{
		config: {
			fonts: "soft",
			heading: "numbered",
			layout: "sidebar",
			link: "dotted",
			palette: "ember",
			scale: "regular",
			shape: "round",
			texture: "none",
		},
		description: "studio site with a side rail",
		id: "studio",
	},
	{
		config: {
			fonts: "rave",
			heading: "slash",
			layout: "magazine",
			link: "invert",
			palette: "acid",
			scale: "huge",
			shape: "sharp",
			texture: "scanlines",
		},
		description: "3am flyer",
		id: "acid",
	},
	{
		config: {
			fonts: "quarterly",
			heading: "serif",
			layout: "column",
			link: "underline",
			palette: "rose",
			scale: "large",
			shape: "round",
			texture: "grain",
		},
		description: "soft-focus literary journal",
		id: "valentine",
	},
	{
		config: {
			fonts: "pixel",
			heading: "block",
			layout: "window",
			link: "invert",
			palette: "dusk",
			scale: "huge",
			shape: "brutal",
			texture: "dots",
		},
		description: "8-bit desktop app",
		id: "arcade",
	},
	{
		config: {
			fonts: "grotesk",
			heading: "rule",
			layout: "column",
			link: "underline",
			nav: "framed",
			palette: "ink",
			scale: "regular",
			shape: "sharp",
			texture: "none",
		},
		description: "rails and hairlines, component-library craft",
		id: "framed",
	},
	{
		config: {
			fonts: "editorial",
			heading: "label",
			layout: "compact",
			link: "underline",
			nav: "minimal",
			palette: "paper",
			scale: "large",
			shape: "soft",
			texture: "none",
		},
		description: "a name, a contact link, the work",
		id: "quiet",
	},
	{
		config: {
			fonts: "grotesk",
			heading: "label",
			layout: "column",
			link: "underline",
			nav: "links",
			palette: "slate",
			scale: "large",
			shape: "soft",
			texture: "none",
		},
		description: "links first, header fades into the page",
		id: "tinkerer",
	},
	{
		config: {
			fonts: "grotesk",
			heading: "block",
			layout: "magazine",
			link: "underline",
			nav: "centered",
			palette: "ink",
			scale: "huge",
			shape: "soft",
			texture: "none",
		},
		description: "centred nav and a button, like a product launch",
		id: "launch",
	},
	{
		config: {
			fonts: "soft",
			heading: "serif",
			layout: "compact",
			link: "marker",
			nav: "dock",
			palette: "rose",
			scale: "large",
			shape: "round",
			texture: "grain",
		},
		description: "a greeting up top, a dock at the bottom",
		id: "hello",
	},
	{
		config: {
			fonts: "soft",
			heading: "marker",
			layout: "bento",
			link: "marker",
			nav: "island",
			palette: "dusk",
			scale: "large",
			shape: "round",
			texture: "none",
		},
		description: "floating pill over a bento grid",
		id: "island",
	},
	{
		config: {
			fonts: "quarterly",
			heading: "rule",
			layout: "newspaper",
			link: "underline",
			nav: "masthead",
			palette: "paper",
			scale: "large",
			shape: "sharp",
			texture: "grain",
		},
		description: "masthead over three ruled columns",
		id: "broadsheet",
	},
	{
		config: {
			fonts: "terminal",
			heading: "slash",
			layout: "compact",
			link: "dotted",
			nav: "keys",
			palette: "slate",
			scale: "regular",
			shape: "sharp",
			texture: "none",
		},
		description: "keyboard first, every link shows its key",
		id: "keys",
	},
	{
		config: {
			fonts: "poster",
			heading: "label",
			layout: "cover",
			link: "underline",
			nav: "corner",
			palette: "ink",
			scale: "regular",
			shape: "sharp",
			texture: "none",
		},
		description: "a full-screen intro and one round button",
		id: "cover",
	},
	{
		config: {
			fonts: "grotesk",
			heading: "label",
			layout: "ledger",
			link: "underline",
			nav: "minimal",
			palette: "paper",
			scale: "regular",
			shape: "soft",
			texture: "none",
		},
		description: "an index: label on the left, rows on the right",
		id: "ledger",
	},
	{
		config: {
			fonts: "quarterly",
			heading: "serif",
			layout: "diptych",
			link: "marker",
			nav: "classic",
			palette: "dusk",
			scale: "regular",
			shape: "soft",
			texture: "grain",
		},
		description: "split screen, the intro on a dark half",
		id: "diptych",
	},
	{
		config: {
			fonts: "soft",
			heading: "numbered",
			layout: "bands",
			link: "marker",
			nav: "island",
			palette: "sage",
			scale: "large",
			shape: "round",
			texture: "none",
		},
		description: "full-width stripes, section by section",
		id: "bands",
	},
	{
		config: {
			fonts: "grotesk",
			heading: "bracket",
			layout: "blueprint",
			link: "dotted",
			nav: "framed",
			palette: "cobalt",
			scale: "regular",
			shape: "sharp",
			texture: "none",
		},
		description: "rails, hatching and klein blue",
		id: "blueprint",
	},
	{
		config: {
			fonts: "soft",
			heading: "serif",
			layout: "column",
			link: "underline",
			nav: "edges",
			palette: "rose",
			scale: "huge",
			shape: "soft",
			texture: "none",
		},
		description: "gallery wall, name and links on the edges",
		id: "gallery",
	},
];

export function applyFontPairing(
	config: DesignConfig,
	pairingId: string
): DesignConfig {
	const pairing = FONT_PAIRINGS.find((item) => item.id === pairingId);
	if (!pairing) {
		return config;
	}
	return {
		...config,
		fontBody: pairing.body,
		fontDisplay: pairing.display,
		fontLabel: pairing.label_font,
		lede: pairing.lede,
	};
}

export const DESIGN_PRESETS = RAW_PRESETS.map(({ config, description, id }) => {
	const { fonts, ...rest } = config;
	return {
		config: applyFontPairing({ ...DEFAULT_DESIGN, ...rest }, fonts),
		description,
		id,
	};
});

export function matchFontPairing(config: DesignConfig) {
	return FONT_PAIRINGS.find(
		(pairing) =>
			pairing.body === config.fontBody &&
			pairing.display === config.fontDisplay &&
			pairing.label_font === config.fontLabel &&
			pairing.lede === config.lede
	);
}

/** presets are looks only; applying one keeps whatever copy you wrote */
export const applyPreset = (
	config: DesignConfig,
	preset: DesignConfig
): DesignConfig => ({ ...preset, copy: config.copy });

export function matchPreset(config: DesignConfig) {
	const key = designKey({ ...config, copy: DEFAULT_COPY });
	return DESIGN_PRESETS.find((preset) => designKey(preset.config) === key);
}

/** stable identity for comparing designs; custom colours only count when used */
export function designKey(config: DesignConfig) {
	const { copy, custom, ...rest } = config;
	const entries = Object.entries(rest).sort(([a], [b]) => a.localeCompare(b));
	const copyEntries = COPY_FIELDS.map(({ key }) => copy[key]);
	return JSON.stringify(
		config.palette === "custom"
			? [entries, copyEntries, custom]
			: [entries, copyEntries]
	);
}

export function paletteModes(config: DesignConfig): PaletteModes {
	if (config.palette === "custom") {
		return config.custom;
	}
	return (
		PALETTES.find((palette) => palette.id === config.palette)?.modes ?? SLATE
	);
}

// ─── validation ─────────────────────────────────────────────────────────

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

const pick = <T extends string>(
	allowed: readonly T[],
	value: unknown,
	fallback: T
): T => (allowed.includes(value as T) ? (value as T) : fallback);

const values = <T extends { value: string }>(list: readonly T[]) =>
	list.map((item) => item.value) as T["value"][];

const FONT_IDS = FONTS.map((font) => font.id) as FontId[];
const PALETTE_IDS = [
	...PALETTES.map((palette) => palette.id),
	"custom",
] as PaletteId[];

function normalizeTokens(
	input: unknown,
	fallback: PaletteTokens
): PaletteTokens {
	const source =
		input && typeof input === "object"
			? (input as Record<string, unknown>)
			: {};
	const result = { ...fallback };
	for (const key of PALETTE_TOKEN_KEYS) {
		const value = source[key];
		if (typeof value === "string" && HEX_COLOR.test(value)) {
			result[key] = value.toLowerCase();
		}
	}
	return result;
}

const RUNS_OF_WHITESPACE = /\s+/g;

/** plain single-line text: newlines and runs of spaces collapse, capped */
const cleanText = (value: unknown, max: number) =>
	typeof value === "string"
		? value.replace(RUNS_OF_WHITESPACE, " ").trim().slice(0, max)
		: null;

function normalizeCopy(input: unknown): HeroCopy {
	const source =
		input && typeof input === "object"
			? (input as Record<string, unknown>)
			: {};
	const result = { ...DEFAULT_COPY };
	for (const { key, max } of COPY_FIELDS) {
		const value = cleanText(source[key], max);
		if (value !== null) {
			result[key] = value;
		}
	}
	// the headline and button carry the section; never let them go blank
	result.headline ||= DEFAULT_COPY.headline;
	result.cta ||= DEFAULT_COPY.cta;
	return result;
}

/**
 * Accepts anything (stored JSON, a postMessage, a request body) and returns a
 * fully valid design. Every value that ends up in generated CSS is either an
 * id from the lists above or a #rrggbb colour, so nothing else can leak in.
 */
export function normalizeDesign(input: unknown): DesignConfig {
	const source =
		input && typeof input === "object"
			? (input as Record<string, unknown>)
			: {};
	const custom =
		source.custom && typeof source.custom === "object"
			? (source.custom as Record<string, unknown>)
			: {};

	return {
		copy: normalizeCopy(source.copy),
		custom: {
			dark: normalizeTokens(custom.dark, SLATE.dark),
			light: normalizeTokens(custom.light, SLATE.light),
		},
		fontBody: pick(FONT_IDS, source.fontBody, DEFAULT_DESIGN.fontBody),
		fontDisplay: pick(FONT_IDS, source.fontDisplay, DEFAULT_DESIGN.fontDisplay),
		fontLabel: pick(FONT_IDS, source.fontLabel, DEFAULT_DESIGN.fontLabel),
		heading: pick(values(HEADINGS), source.heading, DEFAULT_DESIGN.heading),
		layout: pick(values(LAYOUTS), source.layout, DEFAULT_DESIGN.layout),
		lede: pick(values(LEDE_FONTS), source.lede, DEFAULT_DESIGN.lede),
		link: pick(values(LINKS), source.link, DEFAULT_DESIGN.link),
		nav: pick(values(NAVS), source.nav, DEFAULT_DESIGN.nav),
		palette: pick(PALETTE_IDS, source.palette, DEFAULT_DESIGN.palette),
		scale: pick(values(SCALES), source.scale, DEFAULT_DESIGN.scale),
		shape: pick(values(SHAPES), source.shape, DEFAULT_DESIGN.shape),
		texture: pick(values(TEXTURES), source.texture, DEFAULT_DESIGN.texture),
	};
}

export const isHexColor = (value: string) => HEX_COLOR.test(value);

// ─── shuffle ────────────────────────────────────────────────────────────

const randomItem = <T>(list: readonly T[]): T =>
	list[Math.floor(Math.random() * list.length)] as T;

const HUE_TURN = 360;
const RANDOM_PALETTE_CHANCE = 0.35;

function hslToHex(hue: number, saturation: number, lightness: number) {
	const s = saturation / 100;
	const l = lightness / 100;
	const k = (n: number) => (n + hue / 30) % 12;
	const a = s * Math.min(l, 1 - l);
	const channel = (n: number) => {
		const value = l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
		return Math.round(value * 255)
			.toString(16)
			.padStart(2, "0");
	};
	return `#${channel(0)}${channel(8)}${channel(4)}`;
}

/** a random but readable palette: tinted neutrals plus a contrasting accent */
export function randomPalette(): PaletteModes {
	const hue = Math.floor(Math.random() * HUE_TURN);
	// accents a third to two thirds of the wheel away from the base hue
	const accentHue = (hue + 120 + Math.floor(Math.random() * 120)) % HUE_TURN;
	const tint = 10 + Math.floor(Math.random() * 30);
	return {
		dark: tokens(
			hslToHex(hue, tint, 8),
			hslToHex(hue, tint * 0.6, 92),
			hslToHex(hue, tint, 14),
			hslToHex(hue, tint * 0.5, 64),
			hslToHex(hue, tint, 24),
			hslToHex(accentHue, 85, 66)
		),
		light: tokens(
			hslToHex(hue, tint + 10, 97),
			hslToHex(hue, tint, 14),
			hslToHex(hue, tint + 5, 92),
			hslToHex(hue, tint * 0.5, 42),
			hslToHex(hue, tint, 86),
			hslToHex(accentHue, 75, 46)
		),
	};
}

/** a random look; the copy is yours and stays put */
export function shuffleDesign(copy: HeroCopy): DesignConfig {
	const useRandomColours = Math.random() < RANDOM_PALETTE_CHANCE;
	const pairing = randomItem(FONT_PAIRINGS);
	return applyFontPairing(
		{
			copy,
			custom: useRandomColours ? randomPalette() : DEFAULT_DESIGN.custom,
			fontBody: DEFAULT_DESIGN.fontBody,
			fontDisplay: DEFAULT_DESIGN.fontDisplay,
			fontLabel: DEFAULT_DESIGN.fontLabel,
			heading: randomItem(HEADINGS).value,
			layout: randomItem(LAYOUTS).value,
			lede: DEFAULT_DESIGN.lede,
			link: randomItem(LINKS).value,
			nav: randomItem(NAVS).value,
			palette: useRandomColours ? "custom" : randomItem(PALETTES).id,
			scale: randomItem(SCALES).value,
			shape: randomItem(SHAPES).value,
			texture: randomItem(TEXTURES).value,
		},
		pairing.id
	);
}
