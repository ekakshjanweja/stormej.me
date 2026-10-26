"use client";

import { useEffect, useRef, useState } from "react";
import { reducedMotion } from "../_lib/gsap";

/* a ring that trails and a dot that nearly keeps up. anything with
   data-cursor="<mode>" changes the ring; data-cursor-label swaps the ring
   for a small crisp pill with that word, trailing just below and right of
   the pointer. the native cursor stays, so nothing is lost if this fails */

const SCALE: Record<string, number> = {
	cta: 0,
	default: 1,
	drag: 0,
	label: 0,
	nav: 1.78,
	title: 1.5,
	view: 0,
};
const PRESSED = 0.78;
const RING_FOLLOW = 0.2;
const DOT_FOLLOW = 0.35;
const SCALE_FOLLOW = 0.12;
/* the pill sits this far below and right of the ring's centre */
const PILL_OFFSET = 14;

export function Cursor() {
	const [enabled, setEnabled] = useState(false);
	const ringRef = useRef<HTMLDivElement>(null);
	const dotRef = useRef<HTMLDivElement>(null);
	const labelRef = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		const fine = window.matchMedia("(pointer: fine)").matches;
		setEnabled(fine && !reducedMotion());
	}, []);

	useEffect(() => {
		const ring = ringRef.current;
		const dot = dotRef.current;
		const label = labelRef.current;
		const pill = label?.firstElementChild;
		if (!(enabled && ring && dot && label && pill)) {
			return;
		}
		const target = { x: -100, y: -100 };
		const ringAt = { ...target };
		const dotAt = { ...target };
		let scale = 1;
		let mode = "default";
		let pressed = false;
		let visible = false;
		let frame = 0;

		const onMove = (event: PointerEvent) => {
			target.x = event.clientX;
			target.y = event.clientY;
			if (!visible) {
				visible = true;
				ringAt.x = target.x;
				ringAt.y = target.y;
				dotAt.x = target.x;
				dotAt.y = target.y;
				ring.style.opacity = "1";
				dot.style.opacity = "1";
			}
		};
		const onOver = (event: PointerEvent) => {
			const host = (event.target as Element | null)?.closest<HTMLElement>(
				"[data-cursor]"
			);
			mode = host?.dataset.cursor ?? "default";
			const word = host?.dataset.cursorLabel ?? "";
			if (word) {
				pill.textContent = word;
				label.dataset.on = "";
			} else {
				delete label.dataset.on;
			}
			ring.dataset.mode = mode;
		};
		const onDown = () => {
			pressed = true;
		};
		const onUp = () => {
			pressed = false;
		};
		const onLeave = () => {
			visible = false;
			ring.style.opacity = "0";
			dot.style.opacity = "0";
		};

		const tick = () => {
			ringAt.x += (target.x - ringAt.x) * RING_FOLLOW;
			ringAt.y += (target.y - ringAt.y) * RING_FOLLOW;
			dotAt.x += (target.x - dotAt.x) * DOT_FOLLOW;
			dotAt.y += (target.y - dotAt.y) * DOT_FOLLOW;
			const goal = (SCALE[mode] ?? 1) * (pressed ? PRESSED : 1);
			scale += (goal - scale) * SCALE_FOLLOW;
			const turn = mode === "drag" ? 45 : 0;
			ring.style.transform = `translate3d(${ringAt.x}px, ${ringAt.y}px, 0) translate(-50%, -50%) rotate(${turn}deg) scale(${scale})`;
			label.style.transform = `translate3d(${ringAt.x + PILL_OFFSET}px, ${ringAt.y + PILL_OFFSET}px, 0)`;
			dot.style.transform = `translate3d(${dotAt.x}px, ${dotAt.y}px, 0) translate(-50%, -50%)`;
			frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);

		window.addEventListener("pointermove", onMove, { passive: true });
		document.addEventListener("pointerover", onOver, { passive: true });
		window.addEventListener("pointerdown", onDown);
		window.addEventListener("pointerup", onUp);
		document.documentElement.addEventListener("pointerleave", onLeave);
		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener("pointermove", onMove);
			document.removeEventListener("pointerover", onOver);
			window.removeEventListener("pointerdown", onDown);
			window.removeEventListener("pointerup", onUp);
			document.documentElement.removeEventListener("pointerleave", onLeave);
		};
	}, [enabled]);

	if (!enabled) {
		return null;
	}

	return (
		<div aria-hidden="true" className="cursor">
			<div className="cursor-ring" data-mode="default" ref={ringRef} />
			<span className="cursor-label" ref={labelRef}>
				<span className="cursor-pill" />
			</span>
			<div className="cursor-dot" ref={dotRef} />
		</div>
	);
}
