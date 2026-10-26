"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { gsap, reducedMotion } from "../_lib/gsap";

const REACH = 0.7;
const PULL = 0.3;
const TEXT_PULL = 0.15;

/* a pill that leans toward the pointer when it's close, its label leaning
   a little further, and fills from below on hover */
export function Magnetic({ children }: { children: ReactNode }) {
	const rootRef = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		const root = rootRef.current;
		const pill = root?.firstElementChild as HTMLElement | null;
		const text = pill?.querySelector<HTMLElement>("[data-text]");
		const fill = pill?.querySelector<HTMLElement>("[data-fill]");
		const fine = window.matchMedia("(pointer: fine)").matches;
		if (!(root && pill && text && fill && fine) || reducedMotion()) {
			return;
		}
		const pillX = gsap.quickTo(pill, "x", {
			duration: 0.8,
			ease: "power3.out",
		});
		const pillY = gsap.quickTo(pill, "y", {
			duration: 0.8,
			ease: "power3.out",
		});
		const textX = gsap.quickTo(text, "x", {
			duration: 0.8,
			ease: "power3.out",
		});
		const textY = gsap.quickTo(text, "y", {
			duration: 0.8,
			ease: "power3.out",
		});

		const onMove = (event: PointerEvent) => {
			const box = root.getBoundingClientRect();
			const dx = event.clientX - (box.left + box.width / 2);
			const dy = event.clientY - (box.top + box.height / 2);
			const near = Math.hypot(dx, dy) < box.width * REACH;
			pillX(near ? dx * PULL : 0);
			pillY(near ? dy * PULL : 0);
			textX(near ? dx * TEXT_PULL : 0);
			textY(near ? dy * TEXT_PULL : 0);
		};
		const onEnter = () => {
			gsap.fromTo(
				fill,
				{ y: 0, yPercent: 75 },
				{ duration: 0.5, ease: "power3.out", overwrite: true, yPercent: 0 }
			);
		};
		const onLeave = () => {
			gsap.to(fill, {
				duration: 0.5,
				ease: "power3.out",
				overwrite: true,
				y: 0,
				yPercent: -75,
			});
		};
		window.addEventListener("pointermove", onMove, { passive: true });
		pill.addEventListener("pointerenter", onEnter);
		pill.addEventListener("pointerleave", onLeave);
		return () => {
			window.removeEventListener("pointermove", onMove);
			pill.removeEventListener("pointerenter", onEnter);
			pill.removeEventListener("pointerleave", onLeave);
		};
	}, []);

	return (
		<span className="magnetic" ref={rootRef}>
			{children}
		</span>
	);
}

/** the inside of a pill: the fill and the label the magnet moves */
export function PillFace({ children }: { children: ReactNode }) {
	return (
		<>
			<span aria-hidden="true" className="pill-fill" data-fill="" />
			<span className="pill-text" data-text="">
				{children}
			</span>
		</>
	);
}
