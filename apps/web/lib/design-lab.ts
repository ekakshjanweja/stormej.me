/**
 * Design lab: independent design axes that map onto `data-*` attributes on
 * <html>. Every visual change lives in `app/design-lab.css`; this file only
 * describes the options, the curated presets, and how a choice is stored.
 *
 * The first option of every axis is the site as it ships today.
 */

export const DESIGN_AXES = [
	{
		description: "colour tokens, light and dark",
		key: "palette",
		label: "palette",
		options: [
			{
				hint: "cool slate, lime / violet accent",
				label: "slate",
				value: "slate",
			},
			{ hint: "warm cream, terracotta", label: "paper", value: "paper" },
			{ hint: "pure greyscale, electric blue", label: "ink", value: "ink" },
			{ hint: "muted greens", label: "sage", value: "sage" },
			{ hint: "plum night, amber", label: "dusk", value: "dusk" },
		],
	},
	{
		description: "font pairing for body, display and labels",
		key: "type",
		label: "type",
		options: [
			{
				hint: "geist + instrument serif",
				label: "editorial",
				value: "editorial",
			},
			{
				hint: "garamond + instrument serif",
				label: "bookish",
				value: "bookish",
			},
			{ hint: "space mono everywhere", label: "terminal", value: "terminal" },
			{
				hint: "geist only, tight and heavy",
				label: "grotesk",
				value: "grotesk",
			},
		],
	},
	{
		description: "page width and homepage arrangement",
		key: "layout",
		label: "layout",
		options: [
			{ hint: "single centred column", label: "column", value: "column" },
			{ hint: "sticky intro beside the feed", label: "split", value: "split" },
			{ hint: "narrow and dense", label: "compact", value: "compact" },
		],
	},
	{
		description: "how section titles are drawn",
		key: "heading",
		label: "headings",
		options: [
			{ hint: "tracked mono caps", label: "label", value: "label" },
			{ hint: "01 — numbered", label: "numbered", value: "numbered" },
			{ hint: "large serif italic", label: "serif", value: "serif" },
			{ hint: "label with a hairline", label: "rule", value: "rule" },
		],
	},
	{
		description: "accent treatment for links",
		key: "link",
		label: "links",
		options: [
			{ hint: "wavy underline", label: "squiggle", value: "squiggle" },
			{ hint: "straight underline", label: "underline", value: "underline" },
			{ hint: "highlighter swipe", label: "marker", value: "marker" },
		],
	},
] as const;

export type DesignAxis = (typeof DESIGN_AXES)[number];
export type DesignAxisKey = DesignAxis["key"];
export type DesignConfig = {
	[A in DesignAxis as A["key"]]: A["options"][number]["value"];
};

export const DEFAULT_DESIGN = Object.fromEntries(
	DESIGN_AXES.map((axis) => [axis.key, axis.options[0].value])
) as DesignConfig;

export const DESIGN_PRESETS: {
	config: DesignConfig;
	description: string;
	id: string;
	label: string;
}[] = [
	{
		config: DEFAULT_DESIGN,
		description: "what ships today",
		id: "current",
		label: "current",
	},
	{
		config: {
			heading: "serif",
			layout: "column",
			link: "underline",
			palette: "paper",
			type: "bookish",
		},
		description: "a printed quarterly — cream stock, garamond, italic heads",
		id: "press",
		label: "press",
	},
	{
		config: {
			heading: "numbered",
			layout: "compact",
			link: "marker",
			palette: "ink",
			type: "terminal",
		},
		description: "readme energy — mono, numbered, dense",
		id: "terminal",
		label: "terminal",
	},
	{
		config: {
			heading: "rule",
			layout: "split",
			link: "underline",
			palette: "ink",
			type: "grotesk",
		},
		description: "swiss grid — heavy sans, hairlines, two columns",
		id: "swiss",
		label: "swiss",
	},
	{
		config: {
			heading: "numbered",
			layout: "column",
			link: "squiggle",
			palette: "sage",
			type: "editorial",
		},
		description: "the current site, grown some moss",
		id: "garden",
		label: "garden",
	},
	{
		config: {
			heading: "serif",
			layout: "split",
			link: "marker",
			palette: "dusk",
			type: "bookish",
		},
		description: "late-night reading room — plum, amber, serif",
		id: "nocturne",
		label: "nocturne",
	},
];

export const DESIGN_STORAGE_KEY = "stormej.design";

/** Keeps only known axis values, falling back to the default per axis. */
export function normalizeDesign(input: unknown): DesignConfig {
	const source =
		input && typeof input === "object"
			? (input as Record<string, unknown>)
			: {};
	const config: Record<string, string> = {};
	for (const axis of DESIGN_AXES) {
		const value = source[axis.key];
		const known = axis.options.some((option) => option.value === value);
		config[axis.key] = known ? (value as string) : axis.options[0].value;
	}
	return config as DesignConfig;
}

export function applyDesign(config: DesignConfig) {
	const root = document.documentElement;
	for (const axis of DESIGN_AXES) {
		root.dataset[axis.key] = config[axis.key];
	}
}

export function matchPreset(config: DesignConfig) {
	return DESIGN_PRESETS.find((preset) =>
		DESIGN_AXES.every((axis) => preset.config[axis.key] === config[axis.key])
	);
}

/**
 * Runs before hydration so a stored design never flashes the default.
 * `?preset=` or per-axis params (`?palette=paper`) win over storage; they are
 * persisted unless the page is framed (the /design-lab previews), so a framed
 * preview never overwrites the visitor's own pick.
 */
export const DESIGN_INIT_SCRIPT = `(() => {
	try {
		const axes = ${JSON.stringify(
			Object.fromEntries(
				DESIGN_AXES.map((axis) => [
					axis.key,
					axis.options.map((option) => option.value),
				])
			)
		)};
		const presets = ${JSON.stringify(
			Object.fromEntries(
				DESIGN_PRESETS.map((preset) => [preset.id, preset.config])
			)
		)};
		const key = ${JSON.stringify(DESIGN_STORAGE_KEY)};
		const params = new URLSearchParams(location.search);
		let stored = {};
		try { stored = JSON.parse(localStorage.getItem(key) || "{}") || {}; } catch {}
		const fromUrl = Object.assign({}, presets[params.get("preset")] || {});
		for (const axis in axes) {
			if (params.has(axis)) fromUrl[axis] = params.get(axis);
		}
		const merged = Object.assign({}, stored, fromUrl);
		const config = {};
		for (const axis in axes) {
			config[axis] = axes[axis].includes(merged[axis]) ? merged[axis] : axes[axis][0];
			document.documentElement.dataset[axis] = config[axis];
		}
		if (Object.keys(fromUrl).length && window.self === window.top) {
			localStorage.setItem(key, JSON.stringify(config));
		}
	} catch {}
})();`;
