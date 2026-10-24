"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, useState } from "react";
import { pageIntro } from "@/components/curtain/page-intro";
import { COVER, type LoaderProps } from "./types";

gsap.registerPlugin(useGSAP);

const PHRASE = "ekaksh janweja ✺ product ✺ mobile ✺ ai ✺ idea → production ✺ ";
/** [row, text] pairs the strobe cycles through */
const SCHEMES = [
	["var(--foreground)", "var(--background)"],
	["var(--highlight)", "var(--foreground)"],
	["var(--background)", "var(--foreground)"],
	["var(--foreground)", "var(--highlight)"],
] as const;
/** when the colours flip: slow, then faster, then a blur */
const STROBE = [
	0.5, 0.95, 1.3, 1.55, 1.75, 1.9, 2.02, 2.12, 2.2, 2.27, 2.33, 2.38, 2.43,
	2.47,
];

const rowCount = () => (window.innerHeight > window.innerWidth ? 9 : 6);

/**
 * A wall of type: the screen stacked with giant rows of the name running
 * in alternating directions, accelerating, strobing through the palette and
 * squashing like an equaliser, until the rows slam shut one by one.
 */
export function TypeWall({ onDone }: LoaderProps) {
	const root = useRef<HTMLDivElement>(null);
	const [rows] = useState(rowCount);

	useGSAP(
		() => {
			const q = gsap.utils.selector(root);
			const lines = q("[data-row]");
			const tracks = q("[data-track]");
			const speed = { value: 0.6 };

			const paint = (offset: number) => {
				for (const [i, line] of lines.entries()) {
					const [bg, ink] =
						SCHEMES[(i + offset) % SCHEMES.length] ?? SCHEMES[0];
					gsap.set(line, { backgroundColor: bg, color: ink });
				}
			};
			paint(0);

			/* each row loops forever on its own; the timeline only steers speed */
			const loops = tracks.map((track, i) =>
				gsap.fromTo(
					track,
					{ xPercent: i % 2 ? -50 : 0 },
					{
						duration: gsap.utils.random(5, 8),
						ease: "none",
						repeat: -1,
						xPercent: i % 2 ? 0 : -50,
					}
				)
			);
			const steer = () => {
				for (const loop of loops) {
					loop.timeScale(speed.value);
				}
				gsap.set(tracks, { skewX: -speed.value * 1.6 });
			};
			steer();

			const tl = gsap.timeline({ onComplete: onDone });
			tl.from(lines, {
				duration: 0.7,
				ease: "expo.out",
				stagger: { each: 0.05, from: "edges" },
				xPercent: (i) => (i % 2 ? 100 : -100),
			})
				.to(
					speed,
					{ duration: 2.2, ease: "power2.in", onUpdate: steer, value: 9 },
					0.2
				)
				/* equaliser: rows of type squash and stretch */
				.to(
					tracks,
					{
						duration: 0.16,
						ease: "power1.inOut",
						scaleY: () => gsap.utils.random(0.25, 1.35),
						stagger: { each: 0.02, from: "random", repeat: 11, yoyo: true },
					},
					0.9
				);
			for (const [i, at] of STROBE.entries()) {
				tl.call(paint, [i + 1], at);
			}

			/* slam shut */
			tl.call(paint, [0], 2.55)
				.set(root.current, { pointerEvents: "none" }, 2.55)
				.to(
					lines,
					{
						duration: 0.55,
						ease: "expo.in",
						scaleY: 0,
						stagger: { each: 0.045, from: "center" },
						transformOrigin: (i) => (i % 2 ? "50% 0%" : "50% 100%"),
					},
					2.55
				)
				.add(pageIntro(), 2.95);
		},
		{ scope: root }
	);

	const text = PHRASE.repeat(3);

	return (
		<div aria-hidden className={`${COVER} flex flex-col`} ref={root}>
			{Array.from({ length: rows }, (_, i) => (
				<div
					className="-mb-px flex min-h-0 flex-1 items-center overflow-hidden"
					data-row
					// biome-ignore lint/suspicious/noArrayIndexKey: identical rows
					key={i}
				>
					<div
						className="flex w-max whitespace-nowrap font-black uppercase leading-[0.8] tracking-[-0.045em]"
						data-track
						style={{
							fontSize: `calc(100vh / ${rows} * 1.02)`,
							/* every third row is set in outline */
							...(i % 3 === 1
								? {
										WebkitTextFillColor: "transparent",
										WebkitTextStroke: "2px currentColor",
									}
								: {}),
						}}
					>
						<span className="pr-[0.3em]">{text}</span>
						<span className="pr-[0.3em]">{text}</span>
					</div>
				</div>
			))}
		</div>
	);
}
