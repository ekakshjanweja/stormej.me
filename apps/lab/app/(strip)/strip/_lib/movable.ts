"use client";

import { type RefObject, useEffect, useRef } from "react";
import { playSfx } from "@/lib/sfx";
import { Draggable, gsap, reducedMotion } from "./gsap";

/* only where there's a mouse: on touch a drag is how the page scrolls */
const FINE_POINTER = "(hover: hover) and (pointer: fine)";
/* a press that wanders less than this is still a click */
const SLOP_PX = 4;

/** pick something up and move it, within its section. thrown things keep
    a little momentum and stay where they land; with `home`, they spring
    back to their place on release. the click that ends a drag is swallowed,
    so links and buttons inside aren't followed. returns a ref that's true
    when the last press turned into a drag */
export const useMovable = (
	ref: RefObject<HTMLElement | null>,
	{ home = false }: { home?: boolean } = {}
) => {
	const movedRef = useRef(false);

	useEffect(() => {
		const element = ref.current;
		if (
			!element ||
			reducedMotion() ||
			!window.matchMedia(FINE_POINTER).matches
		) {
			return;
		}
		const [draggable] = Draggable.create(element, {
			bounds: element.closest("section") ?? undefined,
			dragClickables: true,
			inertia: !home,
			minimumMovement: SLOP_PX,
			onDragStart() {
				movedRef.current = true;
				element.dataset.moving = "";
				playSfx("pickup");
			},
			onPress() {
				movedRef.current = false;
			},
			onRelease() {
				if (!movedRef.current) {
					return;
				}
				delete element.dataset.moving;
				playSfx(home ? "spring" : "drop");
				/* the click that ends this drag makes no click sound */
				element.dataset.justMoved = "";
				requestAnimationFrame(() => {
					delete element.dataset.justMoved;
				});
				if (home) {
					gsap.to(element, {
						duration: 0.9,
						ease: "elastic.out(1, 0.55)",
						onComplete: () => {
							/* hand the transform back to the stylesheet (hover lifts) */
							gsap.set(element, { clearProps: "transform" });
							draggable?.update();
						},
						x: 0,
						y: 0,
					});
				}
			},
			/* a throw coming to rest */
			onThrowComplete() {
				if (movedRef.current) {
					playSfx("land");
				}
			},
			type: "x,y",
		});
		/* a drag that moved isn't a click on whatever it was dropped from */
		const swallow = (event: MouseEvent) => {
			if (movedRef.current) {
				event.preventDefault();
				event.stopPropagation();
			}
		};
		element.addEventListener("click", swallow, true);
		return () => {
			element.removeEventListener("click", swallow, true);
			draggable?.kill();
		};
	}, [ref, home]);

	return movedRef;
};
