"use client";

import { useEffect, useRef } from "react";
import type { ArtKind } from "../_lib/content";
import { gsap, reducedMotion } from "../_lib/gsap";

/* four small looping drawings, one per card, in a sage ramp. each loop is
   a few steps on the back-expo curve, all on the same 2s beat */

export const SAGE_RAMP = [
	"#3d6a4c",
	"#6f9479",
	"#a6c6ae",
	"#cfe0d3",
	"#e3ede5",
] as const;

const STEP = 2;
const MOVE = 1.5;
const EASE = "backExpoInOut";

type Loop = (svg: SVGSVGElement) => gsap.core.Timeline;

/** three squares hop one slot along the diagonal; the last wraps round */
const squares: Loop = (svg) => {
	const items = Array.from(svg.querySelectorAll<SVGRectElement>("rect"));
	const slots = [
		{ x: 30, y: 85 },
		{ x: 80, y: 45 },
		{ x: 130, y: 5 },
	];
	const timeline = gsap.timeline({ repeat: -1 });
	for (let step = 1; step <= slots.length; step += 1) {
		items.forEach((item, index) => {
			const slot = slots[(index + step) % slots.length];
			timeline.to(
				item,
				{ duration: MOVE, ease: EASE, x: slot?.x, y: slot?.y },
				(step - 1) * STEP + index * 0.05
			);
		});
	}
	timeline.to(
		{},
		{ duration: STEP - MOVE },
		slots.length * STEP - (STEP - MOVE)
	);
	return timeline;
};

/** a stack of cards that fans out, tucks in, and settles */
const stack: Loop = (svg) => {
	const items = Array.from(svg.querySelectorAll<SVGRectElement>("rect"));
	const timeline = gsap.timeline({ repeat: -1 });
	const spreads = [22, 6, 14];
	spreads.forEach((spread, step) => {
		items.forEach((item, index) => {
			const depth = items.length - 1 - index;
			timeline.to(
				item,
				{ duration: MOVE, ease: EASE, x: depth * spread, y: depth * -spread },
				step * STEP + depth * 0.025
			);
		});
	});
	return timeline;
};

/** circles slide past each other and swap places */
const circles: Loop = (svg) => {
	const items = Array.from(svg.querySelectorAll<SVGCircleElement>("circle"));
	const timeline = gsap.timeline({ repeat: -1 });
	const xs = [50, 100, 150];
	for (let step = 1; step <= xs.length; step += 1) {
		items.forEach((item, index) => {
			timeline.to(
				item,
				{
					attr: { cx: xs[(index + step) % xs.length] },
					duration: MOVE,
					ease: EASE,
				},
				(step - 1) * STEP + index * 0.05
			);
		});
	}
	return timeline;
};

/** rectangles turn a quarter each beat, a little out of step */
const turns: Loop = (svg) => {
	const items = Array.from(svg.querySelectorAll<SVGRectElement>("rect"));
	const timeline = gsap.timeline({ repeat: -1 });
	for (let step = 1; step <= 4; step += 1) {
		items.forEach((item, index) => {
			timeline.to(
				item,
				{
					duration: MOVE,
					ease: EASE,
					rotation: step * 90,
					svgOrigin: item.dataset.origin,
				},
				(step - 1) * STEP + index * 0.05
			);
		});
	}
	return timeline;
};

const LOOPS: Record<ArtKind, Loop> = { circles, squares, stack, turns };

function Drawing({ kind }: { kind: ArtKind }) {
	switch (kind) {
		case "squares":
			return (
				<>
					{[0, 1, 2].map((index) => (
						<rect
							fill={SAGE_RAMP[index]}
							height="60"
							key={index}
							rx="8"
							transform={`translate(${30 + index * 50} ${85 - index * 40})`}
							width="60"
						/>
					))}
				</>
			);
		case "stack":
			return (
				<>
					{[3, 2, 1, 0].map((depth) => (
						<rect
							fill={SAGE_RAMP[depth]}
							height="70"
							key={depth}
							rx="10"
							transform={`translate(${depth * 14} ${depth * -14})`}
							width="100"
							x="40"
							y="60"
						/>
					))}
				</>
			);
		case "circles":
			return (
				<>
					{[0, 1, 2].map((index) => (
						<circle
							cx={50 + index * 50}
							cy="75"
							fill={SAGE_RAMP[index + 1]}
							key={index}
							r="28"
							style={{ mixBlendMode: "multiply" }}
						/>
					))}
				</>
			);
		default:
			return (
				<>
					{[0, 1, 2].map((index) => {
						const cx = 50 + index * 50;
						return (
							<rect
								data-origin={`${cx} 75`}
								fill={SAGE_RAMP[index]}
								height="20"
								key={index}
								rx="4"
								width="44"
								x={cx - 22}
								y="65"
							/>
						);
					})}
				</>
			);
	}
}

export function UspArt({ kind }: { kind: ArtKind }) {
	const svgRef = useRef<SVGSVGElement>(null);

	useEffect(() => {
		const svg = svgRef.current;
		if (!svg || reducedMotion()) {
			return;
		}
		const timeline = LOOPS[kind](svg);
		/* only loop while it can be seen */
		const observer = new IntersectionObserver(([entry]) => {
			if (entry?.isIntersecting) {
				timeline.play();
			} else {
				timeline.pause();
			}
		});
		observer.observe(svg);
		return () => {
			observer.disconnect();
			timeline.kill();
		};
	}, [kind]);

	return (
		<svg
			aria-hidden="true"
			className="usp-art"
			focusable="false"
			preserveAspectRatio="xMidYMid meet"
			ref={svgRef}
			viewBox="0 0 220 150"
		>
			<Drawing kind={kind} />
		</svg>
	);
}
