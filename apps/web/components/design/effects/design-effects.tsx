"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { useDesign } from "@/components/design/preview-bridge";
import type { DesignConfig } from "@/lib/design/options";
import type { BackgroundProps } from "./backgrounds/types";
import { useFinePointer, useReducedMotionPreference } from "./use-media-query";

type BackgroundId = Exclude<DesignConfig["background"], "none">;

// every effect is its own chunk, loaded only by designs that use it; they're
// decoration, so none of them needs to render on the server
const BACKGROUNDS: Record<BackgroundId, ComponentType<BackgroundProps>> = {
	aurora: dynamic(
		() => import("./backgrounds/aurora").then((module) => module.Aurora),
		{ ssr: false }
	),
	beams: dynamic(
		() => import("./backgrounds/beams").then((module) => module.Beams),
		{ ssr: false }
	),
	flicker: dynamic(
		() => import("./backgrounds/flicker").then((module) => module.Flicker),
		{ ssr: false }
	),
	meteors: dynamic(
		() => import("./backgrounds/meteors").then((module) => module.Meteors),
		{ ssr: false }
	),
	orbs: dynamic(
		() => import("./backgrounds/orbs").then((module) => module.Orbs),
		{ ssr: false }
	),
	particles: dynamic(
		() => import("./backgrounds/particles").then((module) => module.Particles),
		{ ssr: false }
	),
	plasma: dynamic(
		() => import("./backgrounds/plasma").then((module) => module.Plasma),
		{ ssr: false }
	),
	rain: dynamic(
		() => import("./backgrounds/rain").then((module) => module.Rain),
		{ ssr: false }
	),
	retro: dynamic(
		() => import("./backgrounds/retro").then((module) => module.Retro),
		{ ssr: false }
	),
	ribbons: dynamic(
		() => import("./backgrounds/ribbons").then((module) => module.Ribbons),
		{ ssr: false }
	),
	ripple: dynamic(
		() => import("./backgrounds/ripple").then((module) => module.Ripple),
		{ ssr: false }
	),
	spotlight: dynamic(
		() => import("./backgrounds/spotlight").then((module) => module.Spotlight),
		{ ssr: false }
	),
	squares: dynamic(
		() => import("./backgrounds/squares").then((module) => module.Squares),
		{ ssr: false }
	),
	stars: dynamic(
		() => import("./backgrounds/stars").then((module) => module.Stars),
		{ ssr: false }
	),
};

const DesignCursor = dynamic(
	() => import("./design-cursor").then((module) => module.DesignCursor),
	{ ssr: false }
);

const HoverController = dynamic(
	() => import("./hover-controller").then((module) => module.HoverController),
	{ ssr: false }
);

/**
 * The design's scripted effects: the background layer, the cursor, the
 * scroll progress indicator and the pointer tracking behind the glow and
 * tilt hovers. Mounted first in .design-page (app/layout.tsx). With every
 * axis at its default this renders nothing and loads nothing else; the
 * positioning lives in app/design-motion.css.
 */
export function DesignEffects() {
	const { design } = useDesign();
	const finePointer = useFinePointer();
	const reducedMotion = useReducedMotionPreference();
	const still = design.motion === "off" || reducedMotion;

	const Background =
		design.background === "none" ? null : BACKGROUNDS[design.background];
	const tracksPointer = design.hover === "glow" || design.hover === "tilt";

	return (
		<>
			{Background ? (
				<div
					aria-hidden="true"
					className="design-fx"
					data-fx={design.background}
				>
					<Background still={still} />
				</div>
			) : null}
			{design.progress === "none" ? null : (
				<div aria-hidden="true" className="design-progress" />
			)}
			{finePointer && !reducedMotion && design.cursor !== "default" ? (
				<DesignCursor variant={design.cursor} />
			) : null}
			{finePointer && !reducedMotion && tracksPointer ? (
				<HoverController mode={design.hover === "tilt" ? "tilt" : "glow"} />
			) : null}
		</>
	);
}
