"use client";

import { useEffect } from "react";
import { reducedMotion } from "../_lib/gsap";

const INTERACTIVE = "a[href], button, summary, [role='button']";

/* every click leaves a small mark where it landed: a ring that opens and
   fades, with a spark at its centre. on something you can press it's sage
   and a little bigger; anywhere else a faint ink ring */
export function ClickBurst() {
	useEffect(() => {
		if (reducedMotion()) {
			return;
		}
		const onDown = (event: PointerEvent) => {
			if (event.button !== 0 || !(event.target instanceof Element)) {
				return;
			}
			const burst = document.createElement("span");
			burst.className = "burst";
			burst.setAttribute("aria-hidden", "true");
			if (event.target.closest(INTERACTIVE)) {
				burst.dataset.strong = "";
			}
			burst.style.left = `${event.clientX}px`;
			burst.style.top = `${event.clientY}px`;
			burst.addEventListener("animationend", () => burst.remove(), {
				once: true,
			});
			document.body.append(burst);
		};
		window.addEventListener("pointerdown", onDown, { passive: true });
		return () => window.removeEventListener("pointerdown", onDown);
	}, []);

	return null;
}
