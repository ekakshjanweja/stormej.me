"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { gsap, pauseTracker, reducedMotion, ScrollTrigger } from "../_lib/gsap";

/* lenis on gsap's ticker, so scroll and every scrubbed tween share a frame.
   in-page anchors glide there (1.5s, quint in-out) and move focus with
   them. reduced motion keeps the browser's own scrolling */

const quintInOut = (t: number) =>
	t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2;

let lenis: Lenis | null = null;

/** scrolls to an element (or the top) the same way an anchor would */
export const scrollToTarget = (target: HTMLElement | number) => {
	if (lenis) {
		lenis.scrollTo(target, { duration: 1.5, easing: quintInOut });
		return;
	}
	if (typeof target === "number") {
		window.scrollTo({ top: target });
	} else {
		target.scrollIntoView();
	}
};

/** jumps without easing, for a new page arriving behind the curtain */
export const jumpTo = (target: HTMLElement | number) => {
	if (lenis) {
		lenis.scrollTo(target, { force: true, immediate: true });
		return;
	}
	if (typeof target === "number") {
		window.scrollTo({ behavior: "instant", top: target });
	} else {
		target.scrollIntoView({ behavior: "instant" });
	}
};

const onAnchorClick = (event: MouseEvent) => {
	const link = (event.target as Element | null)?.closest<HTMLAnchorElement>(
		'a[href^="#"]'
	);
	const id = link?.getAttribute("href")?.slice(1);
	if (!(link && id)) {
		return;
	}
	const target = document.getElementById(id);
	if (!target) {
		return;
	}
	event.preventDefault();
	scrollToTarget(target);
	history.replaceState(null, "", `#${id}`);
	/* focus follows, without a second jump */
	if (!target.hasAttribute("tabindex")) {
		target.setAttribute("tabindex", "-1");
	}
	target.focus({ preventScroll: true });
};

export function SmoothScroll() {
	useEffect(() => {
		document.addEventListener("click", onAnchorClick);
		if (reducedMotion()) {
			return () => document.removeEventListener("click", onAnchorClick);
		}
		const instance = new Lenis({ autoRaf: false });
		lenis = instance;
		instance.on("scroll", ScrollTrigger.update);
		const raf = (time: number) => instance.raf(time * 1000);
		gsap.ticker.add(raf);
		gsap.ticker.lagSmoothing(0);
		gsap.ticker.fps(60);
		const offPause = pauseTracker((paused) => {
			if (paused) {
				instance.stop();
			} else {
				instance.start();
			}
		});
		return () => {
			document.removeEventListener("click", onAnchorClick);
			offPause();
			gsap.ticker.remove(raf);
			instance.destroy();
			lenis = null;
		};
	}, []);

	return null;
}
