"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import type Lenis from "lenis";
import { type RefObject, useEffect, useLayoutEffect } from "react";
import { whenReady } from "./phase";

if (typeof window !== "undefined") {
	gsap.registerPlugin(
		useGSAP,
		ScrollTrigger,
		SplitText,
		Draggable,
		InertiaPlugin
	);
}

/* everything imports gsap through here, so the plugins above are always
   registered before anything uses them */
// biome-ignore lint/performance/noBarrelFile: see above
export { useGSAP } from "@gsap/react";
export { gsap } from "gsap";
export { Draggable } from "gsap/Draggable";
export { ScrollTrigger } from "gsap/ScrollTrigger";
export { SplitText } from "gsap/SplitText";

/* the one lenis instance, owned by the shell. null with reduced motion,
   where the page scrolls natively */
let lenis: Lenis | null = null;

export const setLenis = (instance: Lenis | null) => {
	lenis = instance;
};

export const getLenis = () => lenis;

export const scrollToY = (y: number, immediate = false) => {
	if (lenis) {
		lenis.scrollTo(y, { duration: 1.2, immediate });
		return;
	}
	window.scrollTo({ behavior: immediate ? "instant" : "smooth", top: y });
};

export const reducedMotion = () =>
	window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** every strip page runs sideways when there's room to stand the panels up,
    a mouse to drive it and motion is welcome. anywhere else it stacks and
    scrolls down like any page. strip.css repeats this query word for word */
export const SIDEWAYS =
	"(min-width: 1200px) and (min-height: 600px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

/* layout effects so a hidden-at-start tween is set before the first paint */
const useIsomorphicLayoutEffect =
	typeof window === "undefined" ? useEffect : useLayoutEffect;

/** builds a page's entrance once the page is visible, scoped to `scope`,
    and reverts it on unmount. with reduced motion it never runs, so
    everything stays where the markup put it */
export const useEntrance = (
	scope: RefObject<HTMLElement | null>,
	build: (context: gsap.Context) => void
) => {
	useIsomorphicLayoutEffect(() => {
		if (reducedMotion()) {
			return;
		}
		let context: gsap.Context | undefined;
		const off = whenReady(() => {
			context = gsap.context((self) => build(self), scope.current ?? undefined);
		});
		return () => {
			off();
			context?.revert();
		};
		// build is a module-level function per page; scope is a stable ref
	}, [build, scope]);
};
