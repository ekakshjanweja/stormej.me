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
	{
		hint: "warm sand, burnt sienna",
		id: "sand",
		label: "sand",
		modes: {
			dark: tokens(
				"#170c00",
				"#ebe0cf",
				"#261903",
				"#afa390",
				"#41331d",
				"#ffa383"
			),
			light: tokens(
				"#fff5e7",
				"#3b3121",
				"#f7e7cf",
				"#645c51",
				"#e1d2bc",
				"#aa3700"
			),
		},
	},
	{
		hint: "cream and deep honey",
		id: "honey",
		label: "honey",
		modes: {
			dark: tokens(
				"#150d00",
				"#e7e1cf",
				"#231b01",
				"#aba490",
				"#3d351b",
				"#efb146"
			),
			light: tokens(
				"#fef7e1",
				"#383321",
				"#f2e9cd",
				"#625d50",
				"#ddd4ba",
				"#835a01"
			),
		},
	},
	{
		hint: "cocoa paper, caramel",
		id: "cocoa",
		label: "cocoa",
		modes: {
			dark: tokens(
				"#1c0800",
				"#efddd2",
				"#2c1505",
				"#b4a093",
				"#472f1f",
				"#ffa37f"
			),
			light: tokens(
				"#fff5ee",
				"#402f23",
				"#fee4d3",
				"#685b52",
				"#e9cebd",
				"#a63d02"
			),
		},
	},
	{
		hint: "olive paper, moss ink",
		id: "olive",
		label: "olive",
		modes: {
			dark: tokens(
				"#0f1000",
				"#e1e3d1",
				"#1c1e03",
				"#a5a792",
				"#36381e",
				"#a3cf68"
			),
			light: tokens(
				"#f7f9e2",
				"#333423",
				"#eaedd0",
				"#5e5f52",
				"#d4d7bc",
				"#4d7000"
			),
		},
	},
	{
		hint: "yellow-green, sap",
		id: "moss",
		label: "moss",
		modes: {
			dark: tokens(
				"#081201",
				"#dce5d4",
				"#142007",
				"#9ea995",
				"#2e3a22",
				"#8cd472"
			),
			light: tokens(
				"#f0fce5",
				"#2d3625",
				"#e1efd4",
				"#596053",
				"#ccdac0",
				"#307609"
			),
		},
	},
	{
		hint: "pine wash, deep green",
		id: "forest",
		label: "forest",
		modes: {
			dark: tokens(
				"#001307",
				"#d5e7da",
				"#072212",
				"#97aa9c",
				"#233c2c",
				"#71d790"
			),
			light: tokens(
				"#e8fdee",
				"#27382c",
				"#d7f2df",
				"#556158",
				"#c3dcca",
				"#02773b"
			),
		},
	},
	{
		hint: "cool mint, teal ink",
		id: "mint",
		label: "mint",
		modes: {
			dark: tokens(
				"#00130b",
				"#d2e7de",
				"#032218",
				"#93aba1",
				"#1f3c31",
				"#4fd9b4"
			),
			light: tokens(
				"#e6fdf3",
				"#233830",
				"#d4f2e5",
				"#53615b",
				"#c0dcd0",
				"#00755d"
			),
		},
	},
	{
		hint: "lagoon wash, cyan",
		id: "lagoon",
		label: "lagoon",
		modes: {
			dark: tokens(
				"#001313",
				"#cfe7e5",
				"#002221",
				"#90aba9",
				"#1a3c3b",
				"#2ad7d7"
			),
			light: tokens(
				"#e2fdfc",
				"#203837",
				"#cff2f0",
				"#516160",
				"#bcdcda",
				"#017272"
			),
		},
	},
	{
		hint: "ice paper, steel blue",
		id: "glacier",
		label: "glacier",
		modes: {
			dark: tokens(
				"#001219",
				"#d0e6ed",
				"#012029",
				"#91a9b2",
				"#1d3a43",
				"#60cbff"
			),
			light: tokens(
				"#ebfaff",
				"#21373d",
				"#d2eff9",
				"#536065",
				"#bedae3",
				"#046c93"
			),
		},
	},
	{
		hint: "open sky, cobalt ink",
		id: "sky",
		label: "sky",
		modes: {
			dark: tokens(
				"#01101c",
				"#d4e4f1",
				"#081e2d",
				"#95a7b6",
				"#233847",
				"#91c1ff"
			),
			light: tokens(
				"#f1f8fe",
				"#253541",
				"#d7edff",
				"#555f67",
				"#c3d7e8",
				"#1762b6"
			),
		},
	},
	{
		hint: "indigo night, periwinkle",
		id: "indigo",
		label: "indigo",
		modes: {
			dark: tokens(
				"#0a0c1f",
				"#dce0f2",
				"#161a2f",
				"#9fa4b8",
				"#2f344a",
				"#a7bafe"
			),
			light: tokens(
				"#f5f6fe",
				"#2e3242",
				"#e3e8fe",
				"#5a5d69",
				"#cdd3eb",
				"#4759b7"
			),
		},
	},
	{
		hint: "soft iris, violet",
		id: "iris",
		label: "iris",
		modes: {
			dark: tokens(
				"#110a1d",
				"#e3def0",
				"#1f172d",
				"#a7a1b5",
				"#393048",
				"#d1a9ff"
			),
			light: tokens(
				"#f8f5fe",
				"#352f40",
				"#ede5fe",
				"#5f5b68",
				"#d7cfe9",
				"#7847a6"
			),
		},
	},
	{
		hint: "grape wash, magenta",
		id: "grape",
		label: "grape",
		modes: {
			dark: tokens(
				"#150819",
				"#e8dcec",
				"#241529",
				"#ad9fb1",
				"#3e2f43",
				"#f398eb"
			),
			light: tokens(
				"#fcf3ff",
				"#392e3d",
				"#f5e2fa",
				"#635a65",
				"#decde4",
				"#903d8b"
			),
		},
	},
	{
		hint: "wine stain, burgundy",
		id: "wine",
		label: "wine",
		modes: {
			dark: tokens(
				"#1c060b",
				"#f1dbde",
				"#2d1218",
				"#b69da1",
				"#482c31",
				"#ff9ac2"
			),
			light: tokens(
				"#fff4f5",
				"#412d30",
				"#fee1e5",
				"#69595b",
				"#ebcbd0",
				"#a13567"
			),
		},
	},
	{
		hint: "warm white, cherry",
		id: "cherry",
		label: "cherry",
		modes: {
			dark: tokens(
				"#1c0707",
				"#f2dbda",
				"#2d1313",
				"#b79e9c",
				"#482d2c",
				"#ff9fa2"
			),
			light: tokens(
				"#fef4f4",
				"#412d2c",
				"#ffe1e0",
				"#685959",
				"#eaccca",
				"#ab2f3f"
			),
		},
	},
	{
		hint: "shell, coral",
		id: "coral",
		label: "coral",
		modes: {
			dark: tokens(
				"#1c0702",
				"#f1dcd5",
				"#2d140b",
				"#b69f97",
				"#482e25",
				"#ffa28f"
			),
			light: tokens(
				"#fff4f1",
				"#402e27",
				"#fee3da",
				"#695a55",
				"#eacdc3",
				"#ab331f"
			),
		},
	},
	{
		hint: "apricot cream, persimmon",
		id: "apricot",
		label: "apricot",
		modes: {
			dark: tokens(
				"#1b0900",
				"#eeded1",
				"#2b1603",
				"#b3a192",
				"#46301d",
				"#fea47c"
			),
			light: tokens(
				"#fef5ed",
				"#3f2f22",
				"#fee4cf",
				"#675b51",
				"#e7cfbb",
				"#a24100"
			),
		},
	},
	{
		hint: "cool grey, signal blue",
		id: "fog",
		label: "fog",
		modes: {
			dark: tokens(
				"#080f16",
				"#d5e3f2",
				"#141d26",
				"#97a7b7",
				"#2e363f",
				"#92c1fd"
			),
			light: tokens(
				"#f3f7fc",
				"#273442",
				"#e2ebf4",
				"#5b5e61",
				"#ced5dd",
				"#0961bb"
			),
		},
	},
	{
		hint: "warm grey, amber",
		id: "stone",
		label: "stone",
		modes: {
			dark: tokens(
				"#130d05",
				"#eae0cf",
				"#221b0f",
				"#afa390",
				"#3b3429",
				"#f8ab4f"
			),
			light: tokens(
				"#faf6ef",
				"#3b3121",
				"#f0e8dc",
				"#605d59",
				"#dad3c9",
				"#8b5500"
			),
		},
	},
	{
		hint: "blue black, ice",
		id: "midnight",
		label: "midnight",
		modes: {
			dark: tokens(
				"#030e1f",
				"#d7e3f2",
				"#0d1c30",
				"#98a6b8",
				"#27364b",
				"#2ad5e5"
			),
			light: tokens(
				"#f1f7ff",
				"#293442",
				"#ddebfd",
				"#565e6a",
				"#c5d6ec",
				"#02717a"
			),
		},
	},
	{
		hint: "copper brown, bright metal",
		id: "copper",
		label: "copper",
		modes: {
			dark: tokens(
				"#1d0700",
				"#f0ddd3",
				"#2d1406",
				"#b59f95",
				"#492e20",
				"#ffa565"
			),
			light: tokens(
				"#fff4ef",
				"#412e24",
				"#ffe3d5",
				"#695a52",
				"#ebcdbe",
				"#974c00"
			),
		},
	},
	{
		hint: "lilac mist, plum",
		id: "lilac",
		label: "lilac",
		modes: {
			dark: tokens(
				"#160817",
				"#eadceb",
				"#261426",
				"#af9eaf",
				"#402e41",
				"#f999da"
			),
			light: tokens(
				"#fff2ff",
				"#3b2e3b",
				"#f6e2f7",
				"#645a64",
				"#e0cde1",
				"#953d7c"
			),
		},
	},
	{
		hint: "hot pink on blush",
		id: "flamingo",
		label: "flamingo",
		modes: {
			dark: tokens(
				"#1a070e",
				"#f0dbe0",
				"#2b131b",
				"#b69da4",
				"#462d34",
				"#ff96d3"
			),
			light: tokens(
				"#fef4f6",
				"#402d32",
				"#fee1e8",
				"#675a5d",
				"#e7ccd3",
				"#9e3378"
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
	option("stack", "card stack", "sections pile up like cards as you scroll"),
	option("horizontal", "sideways", "the homepage scrolls left to right"),
	option("scrapbook", "scrapbook", "taped-down paper cards at odd angles"),
	option(
		"timeline",
		"timeline",
		"a line down the middle, sections either side"
	),
	option("terminal", "terminal", "every section is a command and its output"),
	option("slides", "slides", "one full-screen slide per section"),
	option("desktop", "desktop", "sections as windows on an old desktop"),
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
	option("tabs", "tabs", "a pill slides under whichever link you point at"),
	option("magnify", "magnify", "an icon dock that swells under the cursor"),
	option("ticker", "ticker", "links scroll past in a strip across the top"),
	option("morph", "morph", "a tiny island that opens into the menu"),
] as const;

/** navbars that render their own markup instead of restyling the shared bar */
export const SCRIPTED_NAVS = ["tabs", "magnify"] as const;

export const NAV_POSITIONS = [
	option("default", "default", "whatever the navbar design does"),
	option("sticky", "sticky", "stays at the top as you scroll"),
	option("static", "not sticky", "scrolls away with the page"),
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
	option("giant", "giant", "huge display type, nearly a poster"),
	option("outline", "outline", "hollow letters, stroked in the accent"),
	option("sticker", "sticker", "a tilted pill slapped on the page"),
	option("gradient", "gradient", "accent gradient drifting through the text"),
] as const;

export const LINKS = [
	option("squiggle", "squiggle", "wavy underline"),
	option("underline", "underline", "straight underline that draws in"),
	option("marker", "marker", "highlighter swipe"),
	option("invert", "invert", "text flips out of a solid block"),
	option("dotted", "dotted", "dotted underline"),
	option("arrow", "arrow", "an arrow slides in after the text"),
	option("glow", "glow", "the text lights up in the accent"),
	option("gradient", "gradient", "a gradient underline sweeps across"),
	option("bracket", "bracket", "[ brackets ] close in around it"),
] as const;

export const TEXTURES = [
	option("none", "none", "flat"),
	option("grain", "grain", "film grain over everything"),
	option("grid", "grid", "graph paper"),
	option("dots", "dots", "dot matrix"),
	option("scanlines", "scanlines", "crt lines"),
	option("mesh", "mesh", "soft blurred colour in the corners"),
	option("lined", "lined", "notebook paper with a margin"),
	option("halftone", "halftone", "print dots fading down the page"),
	option("stripes", "stripes", "fine diagonal pinstripes"),
	option("topo", "topo", "contour lines, like a map"),
] as const;

export const SHAPES = [
	option("soft", "soft", "gently rounded"),
	option("sharp", "sharp", "square corners"),
	option("round", "round", "extra round"),
	option("brutal", "brutal", "hard borders and offset shadows"),
	option("glass", "glass", "frosted panels, best over a background"),
	option("clay", "clay", "puffy, pillowy and pastel-soft"),
	option("pixel", "pixel", "stepped 8-bit borders"),
	option("retro", "retro", "bevelled platinum, like mac os 9"),
	option("elevated", "elevated", "floating cards with deep soft shadows"),
] as const;

export const HEROES = [
	option("plain", "plain", "left aligned, as written"),
	option("centered", "centred", "everything on the middle line"),
	option("name", "name", "your name, huge, behind the intro"),
	option("marquee", "marquee", "the headline runs across the screen"),
	option("boxed", "boxed", "framed with crop marks"),
	option("columns", "columns", "headline left, subline right"),
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

// ─── motion ─────────────────────────────────────────────────────────────

/** how everything moves: one feel drives every animation on the site */
export const MOTION_FEELS = [
	option("smooth", "smooth", "eased out and unhurried"),
	option("subtle", "subtle", "short and small, barely there"),
	option("snappy", "snappy", "quick and crisp"),
	option("springy", "springy", "overshoots, then settles"),
	option("dramatic", "dramatic", "long, far and blurry"),
	option("off", "off", "nothing moves at all"),
] as const;

/** slowest to fastest, so the studio can lay them out as a slider */
export const MOTION_SPEEDS = [
	option("slower", "0.5×", "half speed"),
	option("slow", "0.75×", "a little slower"),
	option("normal", "1×", "as designed"),
	option("fast", "1.5×", "a little quicker"),
	option("faster", "2×", "double speed"),
] as const;

export const ENTRANCES = [
	option("none", "none", "the page is simply there"),
	option("fade", "fade", "sections fade in one after another"),
	option("rise", "rise", "sections float up into place"),
	option("blur", "blur", "sections come into focus"),
	option("scale", "scale", "sections grow in from slightly smaller"),
	option("slide", "slide", "sections slide in from the side"),
	option("clip", "wipe", "sections wipe in from behind a mask"),
	option("flip", "flip", "sections tip forward in 3d"),
] as const;

export const REVEALS = [
	option("none", "none", "nothing happens as you scroll"),
	option("fade", "fade", "sections fade in as they scroll into view"),
	option("rise", "rise", "sections rise as they scroll into view"),
	option("blur", "blur", "sections sharpen as they scroll into view"),
	option("zoom", "zoom", "sections zoom up as they scroll into view"),
	option("sweep", "sweep", "sections sweep in from alternating sides"),
] as const;

export const TEXT_EFFECTS = [
	option("none", "none", "the headline just sits there"),
	option("typewriter", "typewriter", "typed out, caret and all"),
	option("scramble", "scramble", "decodes from random characters"),
	option("blur", "blur", "words drift into focus one by one"),
	option("mask", "mask", "words rise out of a mask"),
	option("letters", "letters", "letters cascade in"),
	option("shimmer", "shimmer", "a sheen sweeps across the text"),
	option("aurora", "aurora", "accent colours flow through the letters"),
	option("highlight", "highlight", "a highlighter swipes across"),
	option("glitch", "glitch", "rgb-split flicker"),
] as const;

export const BACKGROUNDS = [
	option("none", "none", "just the page colour"),
	option("aurora", "aurora", "slow northern lights in the accent"),
	option("orbs", "orbs", "blurred blobs drifting around"),
	option("beams", "beams", "light beams sweeping along curves"),
	option("meteors", "meteors", "streaks falling across the page"),
	option("stars", "stars", "twinkling stars and the odd shooting one"),
	option("particles", "particles", "dots that drift away from the cursor"),
	option("flicker", "flicker", "a grid of flickering cells"),
	option("squares", "squares", "grid squares lighting up at random"),
	option("retro", "retro grid", "a synthwave floor rolling toward you"),
	option("ripple", "ripple", "rings pulsing out behind the intro"),
	option("spotlight", "spotlight", "a stage light swinging over the top"),
] as const;

export const CURSORS = [
	option("default", "default", "your normal cursor"),
	option("ring", "ring", "a ring that follows and grows over links"),
	option("trail", "trail", "a dot with a lagging ring"),
	option("blob", "blob", "an inverting blob"),
	option("spotlight", "spotlight", "a soft light that follows you"),
] as const;

export const HOVERS = [
	option("none", "none", "rows stay put"),
	option("lift", "lift", "rows and cards lift toward you"),
	option("dim", "dim", "everything else fades back"),
	option("slide", "slide", "rows nudge over with an accent bar"),
	option("glow", "glow", "a light follows the cursor inside cards"),
	option("tilt", "tilt", "cards tilt toward the cursor in 3d"),
] as const;

export const PROGRESS_BARS = [
	option("none", "none", "no scroll indicator"),
	option("bar", "bar", "a line fills across the top"),
	option("edge", "edge", "a line fills down the left edge"),
	option("ring", "ring", "a ring fills in the corner, with a percentage"),
] as const;

type ValueOf<T extends readonly { value: string }[]> = T[number]["value"];
type LedeFont = ValueOf<typeof LEDE_FONTS>;

export const STRUCTURE_AXES = [
	{ key: "nav", label: "navbar", options: NAVS },
	{ key: "navPosition", label: "navbar scroll", options: NAV_POSITIONS },
	{ key: "layout", label: "layout", options: LAYOUTS },
	{ key: "hero", label: "intro", options: HEROES },
	{ key: "heading", label: "headings", options: HEADINGS },
	{ key: "link", label: "links", options: LINKS },
	{ key: "texture", label: "texture", options: TEXTURES },
	{ key: "shape", label: "shape", options: SHAPES },
	{ key: "scale", label: "intro size", options: SCALES },
] as const;

/** feel and speed get their own controls; these are plain choices */
export const MOTION_AXES = [
	{ key: "entrance", label: "on load", options: ENTRANCES },
	{ key: "reveal", label: "on scroll", options: REVEALS },
	{ key: "textEffect", label: "headline", options: TEXT_EFFECTS },
	{ key: "background", label: "background", options: BACKGROUNDS },
	{ key: "hover", label: "hover", options: HOVERS },
	{ key: "cursor", label: "cursor", options: CURSORS },
	{ key: "progress", label: "scroll progress", options: PROGRESS_BARS },
] as const;

export type StructureAxis = (typeof STRUCTURE_AXES)[number];
export type StructureKey =
	| StructureAxis["key"]
	| (typeof MOTION_AXES)[number]["key"]
	| "motion"
	| "speed";

export type MotionFeel = ValueOf<typeof MOTION_FEELS>;
export type MotionSpeed = ValueOf<typeof MOTION_SPEEDS>;

interface MotionTokens {
	blur: number;
	/** px a section travels on the way in */
	distance: number;
	/** seconds, before the speed multiplier */
	duration: number;
	/** cubic-bezier control points; springy uses `spring` instead */
	ease: [number, number, number, number];
	/** framer-motion spring for scripted effects, when the feel has one */
	spring?: { damping: number; stiffness: number };
	/** seconds between one section and the next */
	stagger: number;
}

const MOTION_FEEL_TOKENS: Record<MotionFeel, MotionTokens> = {
	dramatic: {
		blur: 18,
		distance: 56,
		duration: 1.3,
		ease: [0.16, 1, 0.3, 1],
		stagger: 0.14,
	},
	off: { blur: 0, distance: 0, duration: 0, ease: [0, 0, 1, 1], stagger: 0 },
	smooth: {
		blur: 8,
		distance: 18,
		duration: 0.7,
		ease: [0.22, 1, 0.36, 1],
		stagger: 0.08,
	},
	snappy: {
		blur: 3,
		distance: 10,
		duration: 0.32,
		ease: [0.2, 0.9, 0.1, 1],
		stagger: 0.035,
	},
	springy: {
		blur: 0,
		distance: 30,
		duration: 0.9,
		ease: [0.34, 1.56, 0.64, 1],
		spring: { damping: 12, stiffness: 180 },
		stagger: 0.07,
	},
	subtle: {
		blur: 3,
		distance: 6,
		duration: 0.45,
		ease: [0.25, 0.46, 0.45, 0.94],
		stagger: 0.04,
	},
};

const SPEED_MULTIPLIERS: Record<MotionSpeed, number> = {
	fast: 0.66,
	faster: 0.5,
	normal: 1,
	slow: 1.33,
	slower: 2,
};

/** the feel's numbers with the speed applied; css.ts and the effects share it */
export function motionTokens(config: Pick<DesignConfig, "motion" | "speed">) {
	const base = MOTION_FEEL_TOKENS[config.motion] ?? MOTION_FEEL_TOKENS.smooth;
	const multiplier = SPEED_MULTIPLIERS[config.speed] ?? 1;
	return {
		...base,
		duration: base.duration * multiplier,
		stagger: base.stagger * multiplier,
	};
}

/**
 * The design as it should actually render: "off" silences every animated
 * axis, so nothing downstream has to check the feel on its own.
 */
export function effectiveDesign(config: DesignConfig): DesignConfig {
	if (config.motion !== "off") {
		return config;
	}
	return {
		...config,
		cursor: "default",
		entrance: "none",
		hover: "none",
		progress: "none",
		reveal: "none",
		textEffect: "none",
	};
}

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
			headline: "mobile engineer who also builds the backend.",
			subline:
				"flutter, ios, and android. apis, uploads, realtime. currently at bullzeye.",
		},
		hint: "the generalist, current job as a footnote",
		id: "original",
	},
	// short ones, written the way the blog and case studies read
	{
		copy: {
			cta: "get in touch",
			eyebrow: "",
			headline: "the happy path is the easy part.",
			subline:
				"mobile engineer. i stay for loading, empty, error, and the api that has to survive them.",
		},
		hint: "crisp: the states people actually hit",
		id: "not-hope",
	},
	{
		copy: {
			cta: "say hi",
			eyebrow: "mobile engineer",
			headline: "app, api, then the weird edge case.",
			subline:
				"i build all three. flutter and native, plus the backend when it isn't someone else's job.",
		},
		hint: "crisp: the stack as a chain",
		id: "arrows",
	},
	{
		copy: {
			cta: "get in touch",
			eyebrow: "",
			headline: "most of the work isn't the screen.",
			subline:
				"it's the upload that resumes, the api that doesn't lie, and the state nobody designed for.",
		},
		hint: "crisp: the product is the unglamorous part",
		id: "reframe",
	},
	{
		copy: {
			cta: "let's talk",
			eyebrow: "ekaksh · new delhi",
			headline: "shipping isn't finishing.",
			subline:
				"mobile engineer who stays for the loading, empty and error states. apps, and the backend behind them.",
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
				"consumer apps on ios and android. uploads that survive a dead network. apis that stay boring.",
		},
		hint: "crisp: prefer the boring answer that works",
		id: "robust",
	},
	{
		copy: {
			cta: "say hi",
			eyebrow: "mobile · backend · ai",
			headline:
				"i build the edge cases nobody asks about until something breaks.",
			subline:
				"a mailbox app at digital domi. capture and uploads at fpv labs. mobile at bullzeye now.",
		},
		hint: "crisp: dry, a little self-aware",
		id: "edge-cases",
	},
	{
		copy: {
			cta: "get in touch",
			eyebrow: "",
			headline: "the app shouldn't have to guess.",
			subline:
				"mobile clients and the apis they depend on. if the data is wrong, the screen doesn't matter.",
		},
		hint: "crisp: one principle, one line of proof",
		id: "downstream",
	},
	{
		copy: {
			cta: "say hi",
			eyebrow: "ekaksh janweja · new delhi",
			headline: "i build mobile apps, and usually the server they talk to.",
			subline:
				"digital domi from scratch, merlin's flutter app, then capture and uploads at fpv labs. currently mobile at bullzeye.",
		},
		hint: "plain words, the actual resume",
		id: "plain",
	},
	{
		copy: {
			cta: "get in touch",
			eyebrow: "mobile engineer",
			headline: "phones, apis, shipped.",
			subline:
				"flutter, ios, android, and the backend behind them. real users since 2021.",
		},
		hint: "short and loud",
		id: "punchy",
	},
	{
		copy: {
			cta: "work with me",
			eyebrow: "mobile engineer",
			headline: "consumer apps, end to end.",
			subline:
				"founding mobile at digital domi. flutter at merlin. capture and uploads at fpv labs. mobile at bullzeye now.",
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
				"apps, backends, and the occasional hard system. off the clock: valorant, mechanical keyboards and seedhe maut on repeat.",
		},
		hint: "a greeting and a bit of personality",
		id: "warm",
	},
	{
		copy: {
			cta: "contact",
			eyebrow: "",
			headline: "mobile engineer. backend when it counts.",
			subline: "currently at bullzeye. before that, digital domi and fpv labs.",
		},
		hint: "three beats and a status line",
		id: "terse",
	},
	{
		copy: {
			cta: "get in touch",
			eyebrow: "ios · android · backend",
			headline: "from the screen to the api, i build the whole product.",
			subline:
				"flutter, swift when it has to be native, and typescript on the server. uploads, realtime, and the interface on top.",
		},
		hint: "the product, top to bottom",
		id: "builder",
	},
];

export const DEFAULT_COPY: HeroCopy = COPY_OPTIONS[0]?.copy as HeroCopy;

export const sameCopy = (a: HeroCopy, b: HeroCopy) =>
	COPY_FIELDS.every(({ key }) => a[key] === b[key]);

export const matchCopyOption = (copy: HeroCopy) =>
	COPY_OPTIONS.find((candidate) => sameCopy(candidate.copy, copy));

// ─── the config ─────────────────────────────────────────────────────────

export interface DesignConfig {
	background: ValueOf<typeof BACKGROUNDS>;
	copy: HeroCopy;
	cursor: ValueOf<typeof CURSORS>;
	/** only read when palette is "custom" */
	custom: PaletteModes;
	entrance: ValueOf<typeof ENTRANCES>;
	fontBody: FontId;
	fontDisplay: FontId;
	fontLabel: FontId;
	heading: ValueOf<typeof HEADINGS>;
	hero: ValueOf<typeof HEROES>;
	hover: ValueOf<typeof HOVERS>;
	layout: ValueOf<typeof LAYOUTS>;
	lede: LedeFont;
	link: ValueOf<typeof LINKS>;
	motion: MotionFeel;
	nav: ValueOf<typeof NAVS>;
	navPosition: ValueOf<typeof NAV_POSITIONS>;
	palette: PaletteId;
	progress: ValueOf<typeof PROGRESS_BARS>;
	reveal: ValueOf<typeof REVEALS>;
	scale: ValueOf<typeof SCALES>;
	shape: ValueOf<typeof SHAPES>;
	speed: MotionSpeed;
	textEffect: ValueOf<typeof TEXT_EFFECTS>;
	texture: ValueOf<typeof TEXTURES>;
}

const SLATE = PALETTES[0].modes;

export const DEFAULT_DESIGN: DesignConfig = {
	background: "none",
	copy: DEFAULT_COPY,
	cursor: "default",
	custom: SLATE,
	entrance: "none",
	fontBody: "geist",
	fontDisplay: "instrument-serif",
	fontLabel: "space-mono",
	heading: "label",
	hero: "plain",
	hover: "none",
	layout: "column",
	lede: "body",
	link: "squiggle",
	motion: "smooth",
	nav: "classic",
	navPosition: "default",
	palette: "slate",
	progress: "none",
	reveal: "none",
	scale: "regular",
	shape: "soft",
	speed: "normal",
	textEffect: "none",
	texture: "none",
};

/** everything the motion tab owns; presets from before it leave these alone */
type MotionKey =
	| "background"
	| "cursor"
	| "entrance"
	| "hover"
	| "motion"
	| "progress"
	| "reveal"
	| "speed"
	| "textEffect";

// ─── presets ────────────────────────────────────────────────────────────

type PresetConfig = Omit<
	DesignConfig,
	| "copy"
	| "custom"
	| "fontBody"
	| "fontDisplay"
	| "fontLabel"
	| "hero"
	| "lede"
	| "nav"
	| "navPosition"
	| MotionKey
> & {
	fonts: (typeof FONT_PAIRINGS)[number]["id"];
	/** older presets keep the plain intro */
	hero?: DesignConfig["hero"];
	/** older presets predate the navbar axis and keep the classic bar */
	nav?: DesignConfig["nav"];
	/** presets leave scrolling to the navbar design unless they say otherwise */
	navPosition?: DesignConfig["navPosition"];
} & Partial<Pick<DesignConfig, MotionKey>>;

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
	// the ones below lean on motion; everything above sits still
	{
		config: {
			background: "aurora",
			cursor: "spotlight",
			entrance: "blur",
			fonts: "soft",
			heading: "label",
			hero: "centered",
			hover: "glow",
			layout: "bento",
			link: "glow",
			motion: "smooth",
			nav: "island",
			palette: "iris",
			reveal: "rise",
			scale: "large",
			shape: "glass",
			textEffect: "aurora",
			texture: "none",
		},
		description: "frosted cards drifting over northern lights",
		id: "aurora",
	},
	{
		config: {
			entrance: "scale",
			fonts: "grotesk",
			heading: "label",
			hover: "lift",
			layout: "desktop",
			link: "invert",
			motion: "snappy",
			nav: "classic",
			palette: "fog",
			scale: "regular",
			shape: "retro",
			textEffect: "typewriter",
			texture: "dots",
		},
		description: "platinum windows on a 1999 desktop",
		id: "platinum",
	},
	{
		config: {
			background: "spotlight",
			entrance: "clip",
			fonts: "poster",
			heading: "giant",
			hero: "name",
			layout: "slides",
			link: "underline",
			motion: "dramatic",
			nav: "corner",
			palette: "midnight",
			progress: "edge",
			scale: "huge",
			shape: "sharp",
			textEffect: "mask",
			texture: "none",
		},
		description: "one slide at a time, lit from above",
		id: "cinema",
	},
	{
		config: {
			cursor: "trail",
			entrance: "fade",
			fonts: "terminal",
			heading: "slash",
			layout: "terminal",
			link: "bracket",
			motion: "snappy",
			nav: "keys",
			palette: "phosphor",
			progress: "bar",
			scale: "regular",
			shape: "sharp",
			textEffect: "typewriter",
			texture: "scanlines",
		},
		description: "a shell session you can scroll",
		id: "shell",
	},
	{
		config: {
			entrance: "flip",
			fonts: "soft",
			heading: "sticker",
			hover: "tilt",
			layout: "scrapbook",
			link: "marker",
			motion: "springy",
			nav: "morph",
			palette: "riso",
			scale: "large",
			shape: "clay",
			textEffect: "highlight",
			texture: "grain",
		},
		description: "taped-down cards that wobble when you touch them",
		id: "collage",
	},
	{
		config: {
			entrance: "rise",
			fonts: "grotesk",
			heading: "giant",
			hover: "dim",
			layout: "stack",
			link: "arrow",
			motion: "smooth",
			nav: "tabs",
			palette: "sky",
			progress: "ring",
			reveal: "zoom",
			scale: "large",
			shape: "elevated",
			textEffect: "blur",
			texture: "none",
		},
		description: "sections pile up like a deck of cards",
		id: "deck",
	},
	{
		config: {
			entrance: "rise",
			fonts: "quarterly",
			heading: "numbered",
			hover: "slide",
			layout: "timeline",
			link: "underline",
			motion: "smooth",
			nav: "morph",
			palette: "sand",
			reveal: "sweep",
			scale: "large",
			shape: "soft",
			textEffect: "letters",
			texture: "topo",
		},
		description: "a career drawn down one line",
		id: "chronicle",
	},
	{
		config: {
			background: "squares",
			entrance: "slide",
			fonts: "poster",
			heading: "outline",
			hero: "marquee",
			layout: "horizontal",
			link: "gradient",
			motion: "snappy",
			nav: "ticker",
			palette: "acid",
			scale: "huge",
			shape: "pixel",
			textEffect: "none",
			texture: "none",
		},
		description: "a flyer that scrolls sideways",
		id: "sideways",
	},
	{
		config: {
			background: "retro",
			cursor: "blob",
			entrance: "rise",
			fonts: "rave",
			heading: "gradient",
			hero: "boxed",
			layout: "cover",
			link: "glow",
			motion: "springy",
			nav: "island",
			palette: "grape",
			reveal: "blur",
			scale: "huge",
			shape: "glass",
			textEffect: "glitch",
			texture: "none",
		},
		description: "neon grid floor, glitching headline",
		id: "synthwave",
	},
	{
		config: {
			entrance: "fade",
			fonts: "bookish",
			heading: "marker",
			layout: "column",
			link: "underline",
			motion: "subtle",
			nav: "masthead",
			palette: "paper",
			reveal: "fade",
			scale: "large",
			shape: "soft",
			textEffect: "highlight",
			texture: "lined",
		},
		description: "ruled paper and a highlighter",
		id: "notebook",
	},
	{
		config: {
			background: "stars",
			entrance: "blur",
			fonts: "editorial",
			heading: "serif",
			hero: "columns",
			layout: "magazine",
			link: "underline",
			motion: "dramatic",
			nav: "magnify",
			palette: "midnight",
			reveal: "blur",
			scale: "huge",
			shape: "soft",
			textEffect: "blur",
			texture: "none",
		},
		description: "a night sky and a dock to steer by",
		id: "starfield",
	},
	{
		config: {
			background: "flicker",
			entrance: "scale",
			fonts: "pixel",
			heading: "block",
			hover: "lift",
			layout: "bento",
			link: "invert",
			motion: "snappy",
			nav: "magnify",
			palette: "phosphor",
			scale: "huge",
			shape: "pixel",
			textEffect: "scramble",
			texture: "none",
		},
		description: "8-bit cards over a flickering grid",
		id: "quest",
	},
	{
		config: {
			background: "orbs",
			cursor: "ring",
			entrance: "rise",
			fonts: "grotesk",
			heading: "rule",
			hero: "centered",
			hover: "lift",
			layout: "column",
			link: "arrow",
			motion: "springy",
			nav: "tabs",
			palette: "lilac",
			progress: "bar",
			reveal: "rise",
			scale: "large",
			shape: "glass",
			textEffect: "shimmer",
			texture: "mesh",
		},
		description: "soft blobs, frosted glass and a bouncy cursor",
		id: "bubble",
	},
	{
		config: {
			background: "particles",
			entrance: "rise",
			fonts: "grotesk",
			heading: "rule",
			hover: "glow",
			layout: "blueprint",
			link: "dotted",
			motion: "smooth",
			nav: "framed",
			palette: "glacier",
			reveal: "fade",
			scale: "regular",
			shape: "sharp",
			textEffect: "scramble",
			texture: "grid",
		},
		description: "an engineering drawing, dust in the air",
		id: "drafting",
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

/** same look, whatever the copy says */
export const sameLook = (a: DesignConfig, b: DesignConfig) =>
	designKey({ ...a, copy: DEFAULT_COPY }) ===
	designKey({ ...b, copy: DEFAULT_COPY });

export function matchPreset(config: DesignConfig) {
	return DESIGN_PRESETS.find((preset) => sameLook(preset.config, config));
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
		background: pick(
			values(BACKGROUNDS),
			source.background,
			DEFAULT_DESIGN.background
		),
		copy: normalizeCopy(source.copy),
		cursor: pick(values(CURSORS), source.cursor, DEFAULT_DESIGN.cursor),
		custom: {
			dark: normalizeTokens(custom.dark, SLATE.dark),
			light: normalizeTokens(custom.light, SLATE.light),
		},
		entrance: pick(values(ENTRANCES), source.entrance, DEFAULT_DESIGN.entrance),
		fontBody: pick(FONT_IDS, source.fontBody, DEFAULT_DESIGN.fontBody),
		fontDisplay: pick(FONT_IDS, source.fontDisplay, DEFAULT_DESIGN.fontDisplay),
		fontLabel: pick(FONT_IDS, source.fontLabel, DEFAULT_DESIGN.fontLabel),
		heading: pick(values(HEADINGS), source.heading, DEFAULT_DESIGN.heading),
		hero: pick(values(HEROES), source.hero, DEFAULT_DESIGN.hero),
		hover: pick(values(HOVERS), source.hover, DEFAULT_DESIGN.hover),
		layout: pick(values(LAYOUTS), source.layout, DEFAULT_DESIGN.layout),
		lede: pick(values(LEDE_FONTS), source.lede, DEFAULT_DESIGN.lede),
		link: pick(values(LINKS), source.link, DEFAULT_DESIGN.link),
		motion: pick(values(MOTION_FEELS), source.motion, DEFAULT_DESIGN.motion),
		nav: pick(values(NAVS), source.nav, DEFAULT_DESIGN.nav),
		navPosition: pick(
			values(NAV_POSITIONS),
			source.navPosition,
			DEFAULT_DESIGN.navPosition
		),
		palette: pick(PALETTE_IDS, source.palette, DEFAULT_DESIGN.palette),
		progress: pick(
			values(PROGRESS_BARS),
			source.progress,
			DEFAULT_DESIGN.progress
		),
		reveal: pick(values(REVEALS), source.reveal, DEFAULT_DESIGN.reveal),
		scale: pick(values(SCALES), source.scale, DEFAULT_DESIGN.scale),
		shape: pick(values(SHAPES), source.shape, DEFAULT_DESIGN.shape),
		speed: pick(values(MOTION_SPEEDS), source.speed, DEFAULT_DESIGN.speed),
		textEffect: pick(
			values(TEXT_EFFECTS),
			source.textEffect,
			DEFAULT_DESIGN.textEffect
		),
		texture: pick(values(TEXTURES), source.texture, DEFAULT_DESIGN.texture),
	};
}

export const isHexColor = (value: string) => HEX_COLOR.test(value);

// ─── shuffle ────────────────────────────────────────────────────────────

const randomItem = <T>(list: readonly T[]): T =>
	list[Math.floor(Math.random() * list.length)] as T;

const HUE_TURN = 360;
const RANDOM_PALETTE_CHANCE = 0.35;

/** a shuffle that turns every effect on at once is noise, so each is a coin flip */
const QUIET_CHANCE = 0.45;

/** a random choice that lands on the list's first ("none") option now and then */
const maybe = <T extends { value: string }>(list: readonly T[]): T["value"] =>
	Math.random() < QUIET_CHANCE
		? (list[0] as T).value
		: randomItem(list.slice(1)).value;

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
			background: maybe(BACKGROUNDS),
			copy,
			cursor: maybe(CURSORS),
			custom: useRandomColours ? randomPalette() : DEFAULT_DESIGN.custom,
			entrance: randomItem(ENTRANCES.slice(1)).value,
			fontBody: DEFAULT_DESIGN.fontBody,
			fontDisplay: DEFAULT_DESIGN.fontDisplay,
			fontLabel: DEFAULT_DESIGN.fontLabel,
			heading: randomItem(HEADINGS).value,
			hero: randomItem(HEROES).value,
			hover: maybe(HOVERS),
			layout: randomItem(LAYOUTS).value,
			lede: DEFAULT_DESIGN.lede,
			link: randomItem(LINKS).value,
			// "off" would hide half of what the shuffle just picked
			motion: randomItem(MOTION_FEELS.filter((feel) => feel.value !== "off"))
				.value,
			nav: randomItem(NAVS).value,
			navPosition: DEFAULT_DESIGN.navPosition,
			palette: useRandomColours ? "custom" : randomItem(PALETTES).id,
			progress: maybe(PROGRESS_BARS),
			reveal: maybe(REVEALS),
			scale: randomItem(SCALES).value,
			shape: randomItem(SHAPES).value,
			speed: DEFAULT_DESIGN.speed,
			textEffect: maybe(TEXT_EFFECTS),
			texture: randomItem(TEXTURES).value,
		},
		pairing.id
	);
}
