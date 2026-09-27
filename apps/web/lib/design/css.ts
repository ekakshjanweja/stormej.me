import {
	type DesignConfig,
	effectiveDesign,
	FONTS,
	type FontId,
	motionTokens,
	type PaletteTokens,
	paletteModes,
} from "./options";

/** Attributes for <html>; app/design.css keys every structural rule off them. */
export function designAttributes(input: DesignConfig) {
	const config = effectiveDesign(input);
	// the sidebar layout turns the bar into its own rail, so no navbar design
	// is layered on top of it
	const nav = config.layout === "sidebar" ? "classic" : config.nav;
	return {
		"data-background": config.background,
		"data-cursor": config.cursor,
		"data-design": "",
		"data-entrance": config.entrance,
		"data-heading": config.heading,
		"data-hero": config.hero,
		"data-hover": config.hover,
		"data-layout": config.layout,
		"data-link": config.link,
		"data-motion": config.motion,
		"data-nav": nav,
		"data-nav-position": config.navPosition,
		"data-palette": config.palette,
		"data-progress": config.progress,
		"data-reveal": config.reveal,
		"data-scale": config.scale,
		"data-shape": config.shape,
		"data-text-effect": config.textEffect,
		"data-texture": config.texture,
	};
}

const SPRING_SAMPLES = 48;
const SPRING_SETTLE_SECONDS = 1.6;

/**
 * A damped spring as a css linear() curve, so css animations can overshoot
 * and settle the same way the framer-motion effects do.
 */
function springEasing({
	damping,
	stiffness,
}: {
	damping: number;
	stiffness: number;
}) {
	const omega = Math.sqrt(stiffness);
	const zeta = damping / (2 * omega);
	const dampedOmega = omega * Math.sqrt(Math.max(1 - zeta * zeta, 0.0001));
	const points: string[] = [];
	for (let index = 0; index <= SPRING_SAMPLES; index += 1) {
		const t = (index / SPRING_SAMPLES) * SPRING_SETTLE_SECONDS;
		const envelope = Math.exp(-zeta * omega * t);
		const value =
			1 -
			envelope *
				(Math.cos(dampedOmega * t) +
					((zeta * omega) / dampedOmega) * Math.sin(dampedOmega * t));
		points.push(index === SPRING_SAMPLES ? "1" : value.toFixed(3));
	}
	return `linear(${points.join(",")})`;
}

/** the feel's easing as a css timing function */
export function motionEasing(config: Pick<DesignConfig, "motion" | "speed">) {
	const tokens = motionTokens(config);
	return tokens.spring
		? springEasing(tokens.spring)
		: `cubic-bezier(${tokens.ease.join(",")})`;
}

/** duration, easing and travel for every animation, css and scripted alike */
function motionVariables(config: DesignConfig) {
	const tokens = motionTokens(config);
	const ease = motionEasing(config);
	return [
		`--motion-duration:${Math.round(tokens.duration * 1000)}ms`,
		`--motion-stagger:${Math.round(tokens.stagger * 1000)}ms`,
		`--motion-distance:${tokens.distance}px`,
		`--motion-blur:${tokens.blur}px`,
		`--motion-ease:${ease}`,
	].join(";");
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

	const rules = [
		`html[data-design]{${fonts}}`,
		`html[data-design]{${motionVariables(config)}}`,
		`html[data-design]{--fx-background-colour:${config.backgroundColour ?? "var(--text-highlight)"}}`,
	];

	if (config.palette !== "slate") {
		const { dark, light } = paletteModes(config);
		rules.push(`html[data-design]{${tokenVariables(light)}}`);
		rules.push(`html[data-design].dark{${tokenVariables(dark)}}`);
	}

	return rules.join("\n");
}
