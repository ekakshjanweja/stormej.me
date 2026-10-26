"use client";

import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
	gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
	/* the two curves the reference leans on: a back-out that overshoots
	   through an expo, and its mirror for big reveals */
	CustomEase.create(
		"backExpoInOut",
		"M0,0 C0.214,-0.173 0.269,-0.083 0.3,0 0.359,0.165 0.345,0.211 0.372,0.427 0.4,0.655 0.436,0.823 0.54,0.892 0.629,0.951 0.698,1 1,1"
	);
	CustomEase.create(
		"expoInOutBack",
		"M0,0 C0.137,0 0.152,0.352 0.184,0.562 0.217,0.79 0.201,1.019 0.383,1.062 0.671,1.13 0.746,1 1,1"
	);
}

/* everything imports gsap through here, so the plugins and eases above are
   always registered before anything uses them */
// biome-ignore lint/performance/noBarrelFile: see above
export { gsap } from "gsap";
export { ScrollTrigger } from "gsap/ScrollTrigger";
export { SplitText } from "gsap/SplitText";

export const reducedMotion = () =>
	typeof window !== "undefined" &&
	window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** touch-first devices get no cursor effects, like the reference */
export const isTouch = () =>
	typeof window !== "undefined" &&
	!window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/** windows high contrast and friends: never hide real text there */
export const forcedColors = () =>
	typeof window !== "undefined" &&
	window.matchMedia("(forced-colors: active)").matches;

/** dpr cap for every canvas on the page */
export const pixelRatio = () =>
	Math.min(
		typeof window === "undefined" ? 1 : window.devicePixelRatio || 1,
		1.5
	);

/* modals pause the canvases and the smooth scroll. anything that animates
   forever listens for this */
export const PAUSE_EVENT = "studio:pause";

export const setPaused = (source: string, paused: boolean) => {
	window.dispatchEvent(
		new CustomEvent(PAUSE_EVENT, { detail: { paused, source } })
	);
};

export interface PauseDetail {
	paused: boolean;
	source: string;
}

/** tracks pause requests from several sources; paused while any is open */
export const pauseTracker = (onChange: (paused: boolean) => void) => {
	const sources = new Set<string>();
	const listener = (event: Event) => {
		const { paused, source } = (event as CustomEvent<PauseDetail>).detail;
		if (paused) {
			sources.add(source);
		} else {
			sources.delete(source);
		}
		onChange(sources.size > 0);
	};
	window.addEventListener(PAUSE_EVENT, listener);
	return () => window.removeEventListener(PAUSE_EVENT, listener);
};
