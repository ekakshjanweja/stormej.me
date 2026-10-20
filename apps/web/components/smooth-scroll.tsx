"use client";

import Lenis from "lenis";
import { useEffect } from "react";

/** below 1, each wheel/trackpad flick travels less: the page feels heavier */
const WHEEL = 0.82;
/** lower = more inertia, a longer, softer settle after each flick. Lenis
 *  restarts its ease on every wheel event, so this stays an ease-out (lerp);
 *  an ease-in curve would stall a trackpad's stream of small events */
const LERP = 0.1;
/** anchor jumps land below the sticky navbar */
const ANCHOR_OFFSET = -96;

/**
 * A weightier scroll for the long case-study pages: wheel and trackpad
 * input is damped and eased (Lenis), so the story and its sliding screens
 * move deliberately rather than skating past. Anchor links glide too.
 *
 * Touch keeps the native scroll (fighting a finger feels broken, not
 * weighty), and reduced motion gets the browser's own scroll: Lenis honours
 * `prefers-reduced-motion` and drops the smoothing.
 */
export function SmoothScroll() {
	useEffect(() => {
		const lenis = new Lenis({
			anchors: { offset: ANCHOR_OFFSET },
			autoRaf: true,
			lerp: LERP,
			smoothWheel: true,
			wheelMultiplier: WHEEL,
		});
		return () => lenis.destroy();
	}, []);

	return null;
}
