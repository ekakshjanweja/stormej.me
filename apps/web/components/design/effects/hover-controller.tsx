"use client";

// pointer tracking after magic ui's magic-card and motion-primitives' tilt
import { useEffect } from "react";

type HoverMode = "glow" | "tilt";

/** layouts where whole homepage sections are cards worth lighting or tilting */
const CARD_LAYOUTS = new Set(["bento", "scrapbook", "desktop"]);
const CARD = ".home-stack > *";
const ROW = "main li:not(.prose-fuma li)";

/**
 * The most a card may tip, in degrees. Big cards tip less so their edges
 * never swing more than ~20px toward or away from the viewer.
 */
const MAX_TILT = 8;
const TILT_REACH = 2400;

const VARIABLES = [
	"--pointer-x",
	"--pointer-y",
	"--tilt-x",
	"--tilt-y",
	"--tilt-angle",
] as const;

function findTarget(from: EventTarget | null) {
	if (!(from instanceof Element)) {
		return null;
	}
	const layout = document.documentElement.dataset.layout ?? "";
	if (CARD_LAYOUTS.has(layout)) {
		const card = from.closest<HTMLElement>(CARD);
		if (card) {
			return card;
		}
	}
	return from.closest<HTMLElement>(ROW);
}

function clear(element: HTMLElement | null) {
	if (!element) {
		return;
	}
	for (const name of VARIABLES) {
		element.style.removeProperty(name);
	}
	element.removeAttribute("data-pointer");
	element.parentElement?.style.removeProperty("--tilt-origin-x");
	element.parentElement?.style.removeProperty("--tilt-origin-y");
}

/**
 * One delegated, rAF-throttled pointermove listener that feeds the pointer's
 * position to whichever row or card is under it, as custom properties that
 * app/design-motion.css turns into a glow or a tilt. It only writes inline
 * custom properties and a data attribute, never React-managed content.
 */
export function HoverController({ mode }: { mode: HoverMode }) {
	useEffect(() => {
		let active: HTMLElement | null = null;
		let frame = 0;
		let latest: PointerEvent | null = null;

		// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: One pointer frame computes the glow or tilt and updates only CSS variables.
		const apply = () => {
			frame = 0;
			const event = latest;
			if (!event) {
				return;
			}
			const target = findTarget(event.target);
			if (target !== active) {
				clear(active);
				active = target;
			}
			if (!active) {
				return;
			}
			const rect = active.getBoundingClientRect();
			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;
			active.setAttribute("data-pointer", "");
			if (mode === "glow") {
				active.style.setProperty("--pointer-x", `${x.toFixed(1)}px`);
				active.style.setProperty("--pointer-y", `${y.toFixed(1)}px`);
				return;
			}
			// the side under the cursor comes toward the viewer. css gets one
			// rotation, as an axis and an angle, since the rotate property can't
			// stack an x and a y turn; for angles this small it's the same thing
			const across = x / rect.width - 0.5;
			const down = y / rect.height - 0.5;
			const turnX = down * 2 * Math.min(MAX_TILT, TILT_REACH / rect.height);
			const turnY = -across * 2 * Math.min(MAX_TILT, TILT_REACH / rect.width);
			const angle = Math.hypot(turnX, turnY);
			// a zero axis is invalid css, so dead centre keeps a nominal one
			active.style.setProperty("--tilt-x", angle ? turnX.toFixed(3) : "1");
			active.style.setProperty("--tilt-y", angle ? turnY.toFixed(3) : "0");
			active.style.setProperty("--tilt-angle", `${angle.toFixed(2)}deg`);
			// the parent owns the perspective; aim its vanishing point at this card
			const parent = active.parentElement;
			if (parent) {
				const box = parent.getBoundingClientRect();
				parent.style.setProperty(
					"--tilt-origin-x",
					`${(rect.left - box.left + rect.width / 2).toFixed(0)}px`
				);
				parent.style.setProperty(
					"--tilt-origin-y",
					`${(rect.top - box.top + rect.height / 2).toFixed(0)}px`
				);
			}
		};

		const onMove = (event: PointerEvent) => {
			if (event.pointerType === "touch") {
				return;
			}
			latest = event;
			if (!frame) {
				frame = requestAnimationFrame(apply);
			}
		};
		const onLeave = () => {
			latest = null;
			clear(active);
			active = null;
		};

		const root = document.documentElement;
		document.addEventListener("pointermove", onMove, { passive: true });
		root.addEventListener("pointerleave", onLeave);
		return () => {
			cancelAnimationFrame(frame);
			document.removeEventListener("pointermove", onMove);
			root.removeEventListener("pointerleave", onLeave);
			clear(active);
		};
	}, [mode]);

	return null;
}
