"use client";

import { type PointerEvent, useCallback, useId, useRef } from "react";
import { gsap, reducedMotion } from "../_lib/gsap";
import { PageLink } from "./page-link";

const SVG_NS = "http://www.w3.org/2000/svg";
const GROW_TO = 110;
const MIN_HOLD_MS = 220;

/* hover drops ink where the pointer comes in; the drops grow and fuse
   through a goo filter until the button is full. leaving drains them */
export function LiquidButton({
	children,
	href,
	label,
}: {
	children: string;
	href: string;
	label: string;
}) {
	const id = useId();
	const svgRef = useRef<SVGSVGElement>(null);
	const enteredAt = useRef(0);
	const drainTimer = useRef(0);

	const onEnter = useCallback((event: PointerEvent<HTMLAnchorElement>) => {
		const svg = svgRef.current;
		if (!svg || reducedMotion()) {
			return;
		}
		window.clearTimeout(drainTimer.current);
		enteredAt.current = performance.now();
		const box = event.currentTarget.getBoundingClientRect();
		const drop = document.createElementNS(SVG_NS, "circle");
		drop.setAttribute("cx", String(event.clientX - box.left));
		drop.setAttribute("cy", String(event.clientY - box.top));
		drop.setAttribute("r", "0");
		svg.querySelector("g")?.append(drop);
		gsap.to(drop, { attr: { r: GROW_TO }, duration: 1, ease: "power3.out" });
	}, []);

	const onLeave = useCallback(() => {
		const svg = svgRef.current;
		if (!svg) {
			return;
		}
		const held = performance.now() - enteredAt.current;
		drainTimer.current = window.setTimeout(
			() => {
				const drops = svg.querySelectorAll("circle");
				gsap.to(drops, {
					attr: { r: 0 },
					duration: 0.4,
					ease: "power2.in",
					onComplete: () => {
						for (const drop of drops) {
							drop.remove();
						}
					},
					overwrite: true,
					stagger: 0.04,
				});
			},
			Math.max(0, MIN_HOLD_MS - held)
		);
	}, []);

	return (
		<PageLink
			className="liquid"
			data-cursor="cta"
			href={href}
			label={label}
			onPointerEnter={onEnter}
			onPointerLeave={onLeave}
		>
			<svg aria-hidden="true" className="liquid-ink" ref={svgRef}>
				<filter id={`${id}-goo`}>
					<feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="8" />
					<feColorMatrix
						in="blur"
						values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
					/>
				</filter>
				<g filter={`url(#${id}-goo)`} />
			</svg>
			<span className="liquid-text">{children}</span>
		</PageLink>
	);
}
