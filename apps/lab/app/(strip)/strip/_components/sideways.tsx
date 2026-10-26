"use client";

import { type ReactNode, useCallback, useEffect, useRef } from "react";
import { getLenis, gsap, ScrollTrigger, SIDEWAYS } from "../_lib/gsap";
import type { Along } from "../_lib/reveals";

const REDUCE = "(prefers-reduced-motion: reduce)";
/* keyboard focus lands this far in from the left edge */
const FOCUS_INSET = 0.25;

/** builds a page's scroll reveals. `along` is the sideways tween when the
    page runs sideways, so triggers can hang off it */
export type Reveal = (along: Along) => void;

/* how far the track travels: the right edge of its last panel, less one
   screen. measured off the panels, so nothing translated inside them can
   stretch the strip */
const distanceOf = (track: HTMLElement) => {
	const last = track.lastElementChild as HTMLElement | null;
	const width = last ? last.offsetLeft + last.offsetWidth : track.scrollWidth;
	return Math.max(0, width - window.innerWidth);
};

/** a row of panels. wide, with a mouse and motion allowed, the pin holds
    the screen while vertical scroll slides the track sideways; the page
    still scrolls natively underneath, so the keyboard, page down and
    screen readers keep working. anywhere else the panels stack */
export function Sideways({
	children,
	className,
	reveal,
}: {
	children: ReactNode;
	className?: string;
	reveal?: Reveal;
}) {
	const rootRef = useRef<HTMLDivElement>(null);
	const pinRef = useRef<HTMLDivElement>(null);
	const trackRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<ScrollTrigger | null>(null);

	useEffect(() => {
		const pin = pinRef.current;
		const track = trackRef.current;
		if (!(pin && track)) {
			return;
		}
		const media = gsap.matchMedia();
		media.add(
			/* matchMedia only runs this when a condition matches, so "always"
			   keeps the stacked, motion-allowed layout from losing its reveals */
			{ always: "all", reduce: REDUCE, sideways: SIDEWAYS },
			(context) => {
				const { reduce, sideways } = context.conditions as {
					reduce: boolean;
					sideways: boolean;
				};
				let along: Along;
				if (sideways) {
					along = gsap.to(track, {
						ease: "none",
						scrollTrigger: {
							end: () => `+=${distanceOf(track)}`,
							invalidateOnRefresh: true,
							pin: true,
							scrub: true,
							start: "top top",
							trigger: pin,
						},
						x: () => -distanceOf(track),
					});
					triggerRef.current = along.scrollTrigger ?? null;
				}
				if (!reduce) {
					reveal?.(along);
				}
				return () => {
					triggerRef.current = null;
				};
			},
			rootRef
		);
		/* panels sized by their text change width once the fonts land */
		let live = true;
		document.fonts?.ready.then(() => {
			if (live) {
				ScrollTrigger.refresh();
			}
		});
		return () => {
			live = false;
			media.revert();
		};
	}, [reveal]);

	/* tabbing into a panel that's off to the side scrolls the page to it */
	const onFocus = useCallback((event: FocusEvent) => {
		const trigger = triggerRef.current;
		const track = trackRef.current;
		const pin = pinRef.current;
		const target = event.target as Element;
		if (!(trigger && track && pin)) {
			return;
		}
		pin.scrollLeft = 0;
		/* only keyboard focus: a mouse click already has its target on screen,
		   and moving the strip under the pointer would eat the click */
		if (!target.matches(":focus-visible")) {
			return;
		}
		const box = target.getBoundingClientRect();
		const left = box.left - track.getBoundingClientRect().left;
		/* already comfortably on screen: leave it be */
		if (box.left >= 0 && box.right <= window.innerWidth * 0.92) {
			return;
		}
		const distance = trigger.end - trigger.start;
		const offset = gsap.utils.clamp(
			0,
			distance,
			left - window.innerWidth * FOCUS_INSET
		);
		const y = trigger.start + offset;
		const lenis = getLenis();
		if (lenis) {
			lenis.scrollTo(y, { immediate: true });
		} else {
			window.scrollTo(0, y);
		}
	}, []);

	useEffect(() => {
		const track = trackRef.current;
		track?.addEventListener("focusin", onFocus);
		return () => track?.removeEventListener("focusin", onFocus);
	}, [onFocus]);

	return (
		<div className={className ? `sw ${className}` : "sw"} ref={rootRef}>
			<div className="sw-pin" ref={pinRef}>
				<div className="sw-track" ref={trackRef}>
					{children}
				</div>
			</div>
		</div>
	);
}
