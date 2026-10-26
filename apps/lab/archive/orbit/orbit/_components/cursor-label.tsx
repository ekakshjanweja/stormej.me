"use client";

import { useEffect, useRef } from "react";
import { damp } from "@/lib/motion";

/* a small pill that trails the pointer and names what a press will do:
   drag the wall, open a card, play a clip. mouse only */

const OFFSET = 16;
const FOLLOW = 18;
/** px; closer than this and the pill has arrived */
const REST = 0.1;

export function CursorLabel({ enabled }: { enabled: boolean }) {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const el = ref.current;
		if (!(el && enabled && window.matchMedia("(pointer: fine)").matches)) {
			return;
		}
		let x = -100;
		let y = -100;
		let targetX = x;
		let targetY = y;
		let last = performance.now();
		let frame = 0;
		let label = "";

		const onMove = (event: PointerEvent) => {
			targetX = event.clientX;
			targetY = event.clientY;
			const source =
				event.target instanceof Element
					? event.target.closest<HTMLElement>("[data-cursor]")
					: null;
			const next = source?.dataset.cursor ?? "";
			if (next !== label) {
				label = next;
				if (next) {
					el.textContent = next;
				}
				el.toggleAttribute("data-on", Boolean(next));
			}
		};
		const onLeave = () => {
			label = "";
			el.removeAttribute("data-on");
		};

		const tick = (now: number) => {
			const dt = Math.min(now - last, 64) / 1000;
			last = now;
			if (Math.abs(targetX - x) + Math.abs(targetY - y) > REST) {
				x = damp(x, targetX, FOLLOW, dt);
				y = damp(y, targetY, FOLLOW, dt);
				el.style.translate = `${x + OFFSET}px ${y + OFFSET}px`;
			}
			frame = requestAnimationFrame(tick);
		};

		window.addEventListener("pointermove", onMove, { passive: true });
		document.documentElement.addEventListener("pointerleave", onLeave);
		frame = requestAnimationFrame(tick);
		return () => {
			window.removeEventListener("pointermove", onMove);
			document.documentElement.removeEventListener("pointerleave", onLeave);
			cancelAnimationFrame(frame);
			el.removeAttribute("data-on");
		};
	}, [enabled]);

	return <div aria-hidden className="cursor-label" ref={ref} />;
}
