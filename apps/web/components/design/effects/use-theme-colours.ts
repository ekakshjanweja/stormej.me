"use client";

import { useSyncExternalStore } from "react";

/** an sRGB colour as 0-255 channels */
export type Rgb = readonly [number, number, number];

export interface ThemeColours {
	accent: Rgb;
	background: Rgb;
	border: Rgb;
	foreground: Rgb;
	muted: Rgb;
}

const VARIABLES: Record<keyof ThemeColours, string> = {
	accent: "--text-highlight",
	background: "--background",
	border: "--border",
	foreground: "--foreground",
	muted: "--muted-foreground",
};

// the default slate palette in light mode, for the server render
const FALLBACK: ThemeColours = {
	accent: [124, 58, 237],
	background: [252, 253, 255],
	border: [223, 227, 233],
	foreground: [30, 36, 46],
	muted: [118, 124, 135],
};

/** css colour string with an alpha, for canvas fills and inline styles */
export const rgba = ([r, g, b]: Rgb, alpha = 1) =>
	`rgb(${r} ${g} ${b} / ${alpha})`;

/** blend two colours; `share` is how much of `b` ends up in the result */
export const mixRgb = (a: Rgb, b: Rgb, share: number): Rgb => [
	Math.round(a[0] + (b[0] - a[0]) * share),
	Math.round(a[1] + (b[1] - a[1]) * share),
	Math.round(a[2] + (b[2] - a[2]) * share),
];

/** relative luminance, enough to tell a dark page from a light one */
export const isDark = ([r, g, b]: Rgb) =>
	(0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.5;

let probe: HTMLSpanElement | null = null;
let pixel: CanvasRenderingContext2D | null = null;

/**
 * Palettes are oklch() and color-mix() strings, which canvas can't always
 * take directly: a probe element resolves var() and color-mix() to a
 * computed colour, then a 1×1 canvas flattens any colour space to sRGB bytes.
 */
function resolve(variable: string, fallback: Rgb): Rgb {
	if (!probe) {
		probe = document.createElement("span");
		probe.setAttribute("aria-hidden", "true");
		probe.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
	}
	if (!probe.isConnected) {
		document.documentElement.appendChild(probe);
	}
	if (!pixel) {
		const canvas = document.createElement("canvas");
		canvas.width = 1;
		canvas.height = 1;
		pixel = canvas.getContext("2d", { willReadFrequently: true });
	}
	if (!pixel) {
		return fallback;
	}
	probe.style.color = "";
	probe.style.color = `var(${variable})`;
	const computed = getComputedStyle(probe).color;
	pixel.clearRect(0, 0, 1, 1);
	pixel.fillStyle = "#000";
	pixel.fillStyle = computed;
	pixel.fillRect(0, 0, 1, 1);
	const [r = 0, g = 0, b = 0] = pixel.getImageData(0, 0, 1, 1).data;
	return [r, g, b];
}

function read(): ThemeColours {
	const next = {} as Record<keyof ThemeColours, Rgb>;
	for (const key of Object.keys(VARIABLES) as (keyof ThemeColours)[]) {
		next[key] = resolve(VARIABLES[key], FALLBACK[key]);
	}
	probe?.remove();
	return next;
}

const sameColours = (a: ThemeColours, b: ThemeColours) =>
	(Object.keys(VARIABLES) as (keyof ThemeColours)[]).every((key) =>
		a[key].every((channel, index) => channel === b[key][index])
	);

let snapshot: ThemeColours = FALLBACK;
let hasRead = false;
const listeners = new Set<() => void>();
let teardown: (() => void) | null = null;

function refresh() {
	const next = read();
	hasRead = true;
	if (sameColours(next, snapshot)) {
		return;
	}
	snapshot = next;
	for (const listener of listeners) {
		listener();
	}
}

/**
 * One set of observers for every effect on the page: the studio swaps
 * palettes by rewriting #site-design and flips light/dark on <html>, and
 * canvases have to re-colour the moment either happens.
 */
function start() {
	let frame = 0;
	const schedule = () => {
		if (!frame) {
			frame = requestAnimationFrame(() => {
				frame = 0;
				refresh();
			});
		}
	};
	const root = new MutationObserver(schedule);
	root.observe(document.documentElement, { attributes: true });
	const sheet = new MutationObserver(schedule);
	const style = document.getElementById("site-design");
	if (style) {
		sheet.observe(style, {
			characterData: true,
			childList: true,
			subtree: true,
		});
	}
	const scheme = window.matchMedia("(prefers-color-scheme: dark)");
	scheme.addEventListener("change", schedule);
	return () => {
		cancelAnimationFrame(frame);
		root.disconnect();
		sheet.disconnect();
		scheme.removeEventListener("change", schedule);
	};
}

function subscribe(listener: () => void) {
	listeners.add(listener);
	if (!teardown) {
		teardown = start();
		refresh();
	}
	return () => {
		listeners.delete(listener);
		if (listeners.size === 0 && teardown) {
			teardown();
			teardown = null;
		}
	};
}

function getSnapshot() {
	if (!hasRead) {
		refresh();
	}
	return snapshot;
}

const getServerSnapshot = () => FALLBACK;

/** the palette as resolved sRGB, kept current as the theme changes */
export const useThemeColours = () =>
	useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
