/**
 * The site palette: six colours per mode, edited in the vault and published
 * to the worker. Everything else (cards, inputs, focus rings, the
 * contribution graph) is derived from these six in colorsCss.
 */

export const COLOR_KEYS = [
	"background",
	"foreground",
	"surface",
	"muted",
	"border",
	"accent",
] as const;

export type ColorKey = (typeof COLOR_KEYS)[number];
export type ModeColors = Record<ColorKey, string>;
export interface SiteColors {
	dark: ModeColors;
	light: ModeColors;
}

export const COLOR_LABELS: Record<ColorKey, string> = {
	accent: "accent",
	background: "background",
	border: "lines",
	foreground: "text",
	muted: "quiet text",
	surface: "surface",
};

const mode = (
	background: string,
	foreground: string,
	surface: string,
	muted: string,
	border: string,
	accent: string
): ModeColors => ({ accent, background, border, foreground, muted, surface });

/**
 * Ready-made palettes for the vault. Each passes WCAG AA for text, quiet
 * text and the accent against its background, in both modes.
 */
export const COLOR_PRESETS: {
	colors: SiteColors;
	hint: string;
	id: string;
	label: string;
}[] = [
	{
		colors: {
			dark: mode(
				"#111311",
				"#e7ebe6",
				"#1b1e1b",
				"#949b93",
				"#262a26",
				"#8fc09d"
			),
			light: mode(
				"#f5f6f2",
				"#1a1d1a",
				"#ebede7",
				"#646c63",
				"#e0e3dc",
				"#3d6a4c"
			),
		},
		hint: "pale green-grey paper, forest green",
		id: "sage",
		label: "sage",
	},
	{
		colors: {
			dark: mode(
				"#141312",
				"#ecebe8",
				"#1e1d1b",
				"#9a958d",
				"#2a2826",
				"#e8794f"
			),
			light: mode(
				"#faf9f7",
				"#1c1b19",
				"#f2f0ec",
				"#6f6b64",
				"#e7e4df",
				"#b4471f"
			),
		},
		hint: "warm neutral, terracotta",
		id: "terracotta",
		label: "terracotta",
	},
	{
		colors: {
			dark: mode(
				"#101115",
				"#e9e9ee",
				"#1a1b20",
				"#9898a3",
				"#25262c",
				"#8ea3ff"
			),
			light: mode(
				"#f8f7f4",
				"#191a1f",
				"#efeee9",
				"#6b6b74",
				"#e5e3de",
				"#2b4fd4"
			),
		},
		hint: "paper white, ink blue",
		id: "ink",
		label: "ink",
	},
	{
		colors: {
			dark: mode(
				"#151214",
				"#ede8ea",
				"#1f1b1d",
				"#a0969b",
				"#2b2629",
				"#d98bb3"
			),
			light: mode(
				"#faf8f8",
				"#1e1a1c",
				"#f2eef0",
				"#726a6e",
				"#ebe5e7",
				"#8a3a63"
			),
		},
		hint: "blush white, plum",
		id: "plum",
		label: "plum",
	},
	{
		colors: {
			dark: mode(
				"#1a1d23",
				"#e2e5ea",
				"#2a2e36",
				"#9aa0ab",
				"#414752",
				"#d6f06a"
			),
			light: mode(
				"#fbfcfe",
				"#2b303a",
				"#eef1f5",
				"#6a7280",
				"#dfe3ea",
				"#7c2cf0"
			),
		},
		hint: "the original site: cool slate, violet and lime",
		id: "slate",
		label: "slate",
	},
	{
		colors: {
			dark: mode(
				"#0a0a0a",
				"#ededed",
				"#171717",
				"#a3a3a3",
				"#262626",
				"#ededed"
			),
			light: mode(
				"#fafafa",
				"#171717",
				"#f0f0f0",
				"#737373",
				"#e5e5e5",
				"#171717"
			),
		},
		hint: "pure greyscale, no accent colour",
		id: "mono",
		label: "mono",
	},
];

/** sage; app/globals.css carries the same values as the built-in palette */
export const DEFAULT_COLORS: SiteColors = (
	COLOR_PRESETS[0] as (typeof COLOR_PRESETS)[number]
).colors;

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

export const isHexColor = (value: unknown): value is string =>
	typeof value === "string" && HEX_COLOR.test(value);

function normalizeMode(input: unknown, fallback: ModeColors): ModeColors {
	const source =
		input && typeof input === "object"
			? (input as Record<string, unknown>)
			: {};
	const result = { ...fallback };
	for (const key of COLOR_KEYS) {
		const value = source[key];
		if (isHexColor(value)) {
			result[key] = value.toLowerCase();
		}
	}
	return result;
}

/**
 * Anything (stored json, a request body) in, a valid palette out. Only
 * #rrggbb strings ever reach the generated css.
 */
export function normalizeColors(input: unknown): SiteColors {
	const source =
		input && typeof input === "object"
			? (input as Record<string, unknown>)
			: {};
	return {
		dark: normalizeMode(source.dark, DEFAULT_COLORS.dark),
		light: normalizeMode(source.light, DEFAULT_COLORS.light),
	};
}

export const sameColors = (a: SiteColors, b: SiteColors) =>
	COLOR_KEYS.every(
		(key) => a.light[key] === b.light[key] && a.dark[key] === b.dark[key]
	);

const mix = (colour: string, share: number, base: string) =>
	`color-mix(in oklab, ${colour} ${share}%, ${base})`;

function modeVariables(colors: ModeColors) {
	const { accent, background, border, foreground, muted, surface } = colors;
	return [
		`--background:${background}`,
		`--foreground:${foreground}`,
		`--card:${surface}`,
		`--card-foreground:${foreground}`,
		`--popover:${background}`,
		`--popover-foreground:${foreground}`,
		`--primary:${foreground}`,
		`--primary-foreground:${background}`,
		`--secondary:${surface}`,
		`--secondary-foreground:${foreground}`,
		`--muted:${surface}`,
		`--muted-foreground:${muted}`,
		`--accent:${surface}`,
		`--accent-foreground:${foreground}`,
		`--border:${border}`,
		`--input:${border}`,
		`--ring:${accent}`,
		`--highlight:${accent}`,
		`--text-highlight:${accent}`,
		`--contribution-0:${surface}`,
		`--contribution-1:${mix(accent, 30, background)}`,
		`--contribution-2:${mix(accent, 55, background)}`,
		`--contribution-3:${mix(accent, 80, background)}`,
		`--contribution-4:${accent}`,
	].join(";");
}

/**
 * Overrides for app/globals.css. Scoped with :not(.dark) / .dark so a
 * light override never leaks into dark mode, whatever order they load in.
 */
export const colorsCss = (colors: SiteColors) =>
	[
		`:root:not(.dark){${modeVariables(colors.light)}}`,
		`:root.dark{${modeVariables(colors.dark)}}`,
	].join("\n");
