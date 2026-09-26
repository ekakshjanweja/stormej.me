import {
	type DesignConfig,
	FONTS,
	type FontId,
	type PaletteTokens,
	paletteModes,
} from "./options";

/** Attributes for <html>; app/design.css keys every structural rule off them. */
export function designAttributes(config: DesignConfig) {
	// the sidebar layout turns the bar into its own rail, so no navbar design
	// is layered on top of it
	const nav = config.layout === "sidebar" ? "classic" : config.nav;
	return {
		"data-design": "",
		"data-heading": config.heading,
		"data-layout": config.layout,
		"data-link": config.link,
		"data-nav": nav,
		"data-palette": config.palette,
		"data-scale": config.scale,
		"data-shape": config.shape,
		"data-texture": config.texture,
	};
}

const fontById = (id: FontId) =>
	FONTS.find((font) => font.id === id) ?? FONTS[0];

const fontStack = (id: FontId) => {
	const font = fontById(id);
	return `var(${font.variable}), ${font.fallback}`;
};

/** Mix a share of `colour` into `base`; used to derive the tokens nobody picks by hand. */
const mix = (colour: string, share: number, base: string) =>
	`color-mix(in oklab, ${colour} ${share}%, ${base})`;

function tokenVariables(tokens: PaletteTokens) {
	const { accent, background, border, foreground, muted, surface } = tokens;
	return [
		`--background:${background}`,
		`--foreground:${foreground}`,
		`--card:${mix(surface, 55, background)}`,
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
 * The per-design stylesheet: font roles always, colour tokens unless the
 * palette is the default slate (globals.css already carries that one).
 * Inputs are validated ids and #rrggbb strings, see normalizeDesign.
 */
export function designCss(config: DesignConfig) {
	const display = fontById(config.fontDisplay);
	const ledeFont =
		config.lede === "display" ? display : fontById(config.fontBody);
	const fonts = [
		`--font-sans:${fontStack(config.fontBody)}`,
		`--font-display:${fontStack(config.fontDisplay)}`,
		`--font-serif:${fontStack(config.fontDisplay)}`,
		`--font-label:${fontStack(config.fontLabel)}`,
		`--font-lede:${config.lede === "display" ? "var(--font-display)" : "var(--font-sans)"}`,
		`--display-weight:${display.display.weight}`,
		`--display-tracking:${display.display.tracking}`,
		`--lede-weight:${ledeFont.lede.weight}`,
		`--lede-tracking:${ledeFont.lede.tracking}`,
	].join(";");

	const rules = [`html[data-design]{${fonts}}`];

	if (config.palette !== "slate") {
		const { dark, light } = paletteModes(config);
		rules.push(`html[data-design]{${tokenVariables(light)}}`);
		rules.push(`html[data-design].dark{${tokenVariables(dark)}}`);
	}

	return rules.join("\n");
}
