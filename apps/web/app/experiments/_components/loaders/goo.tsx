"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useId, useRef } from "react";
import { pageIntro } from "@/components/curtain/page-intro";
import { COVER, type LoaderProps } from "./types";

gsap.registerPlugin(useGSAP);

const BLOBS = 9;
/** the splash: a grid of drops big enough to merge into one solid sheet */
const DROP_COLS = 6;
const DROP_ROWS = 4;

/**
 * Liquid sage. One drop splits into a ring of blobs that orbit, swell and
 * stretch into each other (an svg blur-and-threshold "goo" filter), they
 * collapse back into one, say hi, flood the screen, and the flood bursts
 * into droplets that fly off to reveal the page.
 */
export function Goo({ onDone }: LoaderProps) {
	const root = useRef<HTMLDivElement>(null);
	const filter = `goo${useId().replaceAll(":", "")}`;

	useGSAP(
		() => {
			const q = gsap.utils.selector(root);
			const [orbit] = q("[data-orbit]");
			const blobs = q("[data-blob]");
			const drops = q("[data-drop]");
			const [hello] = q("[data-hello]");
			const [paper] = q("[data-paper]");
			const vw = window.innerWidth;
			const vh = window.innerHeight;
			const unit = Math.min(vw, vh);
			const blob = unit * 0.2;
			const radius = unit * 0.27;
			const flood = (Math.hypot(vw, vh) / blob) * 1.2;

			gsap.set(drops, { scale: 0 });
			const tl = gsap.timeline({ onComplete: onDone });

			/* one drop */
			tl.from(blobs, { duration: 0.8, ease: "elastic.out(1, 0.45)", scale: 0 })
				/* splits into a ring */
				.to(
					blobs,
					{
						duration: 1.1,
						ease: "elastic.out(1, 0.5)",
						scale: () => gsap.utils.random(0.45, 0.9),
						stagger: { amount: 0.3, from: "random" },
						x: (i) => Math.cos((i / BLOBS) * Math.PI * 2) * radius,
						y: (i) => Math.sin((i / BLOBS) * Math.PI * 2) * radius,
					},
					0.55
				)
				.to(
					orbit ?? [],
					{ duration: 2.4, ease: "power1.inOut", rotation: 300 },
					0.55
				)
				/* breathing: neighbours swell into each other and pull apart */
				.to(
					blobs,
					{
						duration: 0.3,
						ease: "sine.inOut",
						scale: () => gsap.utils.random(0.3, 1.25),
						stagger: { each: 0.04, from: "random", repeat: 3, yoyo: true },
					},
					1.3
				)
				/* everything back into one */
				.to(
					blobs,
					{
						duration: 0.6,
						ease: "back.in(2.5)",
						scale: 1,
						stagger: { amount: 0.18, from: "random" },
						x: 0,
						y: 0,
					},
					2.55
				)
				/* a jelly wobble */
				.to(
					blobs,
					{
						duration: 0.35,
						ease: "sine.inOut",
						repeat: 1,
						scaleX: 1.22,
						scaleY: 0.84,
						yoyo: true,
					},
					">"
				)
				.fromTo(
					hello ?? [],
					{ opacity: 0, scale: 0.6 },
					{ duration: 0.45, ease: "back.out(3)", opacity: 1, scale: 1 },
					"<"
				)
				.to(hello ?? [], { duration: 0.2, opacity: 0, scale: 1.4 }, ">0.25")
				/* flood */
				.to(blobs, { duration: 0.75, ease: "expo.in", scale: flood }, "<")
				/* the flood is now the drops: same colour, merged, so no seam */
				.set(paper ?? [], { autoAlpha: 0 })
				.set(drops, { scale: 1 })
				.set(blobs, { autoAlpha: 0 })
				.set(root.current, { pointerEvents: "none" })
				.to(drops, {
					duration: 0.9,
					ease: "power3.in",
					scale: 0,
					stagger: {
						amount: 0.45,
						from: "center",
						grid: [DROP_ROWS, DROP_COLS],
					},
					x: (i) =>
						((i % DROP_COLS) + 0.5 - DROP_COLS / 2) * (vw / DROP_COLS) * 0.9,
					y: (i) =>
						(Math.floor(i / DROP_COLS) + 0.5 - DROP_ROWS / 2) *
						(vh / DROP_ROWS) *
						0.9,
				})
				.add(pageIntro(), "<0.25");
		},
		{ scope: root }
	);

	const dropSize = `max(${(100 / DROP_COLS) * 1.9}vw, ${(100 / DROP_ROWS) * 1.9}vh)`;

	return (
		<div aria-hidden className={COVER} ref={root}>
			<div className="absolute inset-0 bg-background" data-paper />
			<svg aria-hidden className="absolute size-0">
				<title>goo filter</title>
				<defs>
					<filter id={filter}>
						<feGaussianBlur
							in="SourceGraphic"
							result="blur"
							stdDeviation="18"
						/>
						<feColorMatrix
							in="blur"
							values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 30 -13"
						/>
					</filter>
				</defs>
			</svg>
			<div className="absolute inset-0" style={{ filter: `url(#${filter})` }}>
				<div className="absolute top-1/2 left-1/2" data-orbit>
					{Array.from({ length: BLOBS }, (_, i) => (
						<div
							className="absolute size-[20vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-highlight"
							data-blob
							// biome-ignore lint/suspicious/noArrayIndexKey: identical blobs
							key={i}
							style={{ left: 0, top: 0 }}
						/>
					))}
				</div>
				{Array.from({ length: DROP_COLS * DROP_ROWS }, (_, i) => (
					<div
						className="absolute rounded-full bg-highlight"
						data-drop
						// biome-ignore lint/suspicious/noArrayIndexKey: identical drops
						key={i}
						style={{
							height: dropSize,
							left: `${((i % DROP_COLS) + 0.5) * (100 / DROP_COLS)}%`,
							marginLeft: `calc(${dropSize} / -2)`,
							marginTop: `calc(${dropSize} / -2)`,
							top: `${(Math.floor(i / DROP_COLS) + 0.5) * (100 / DROP_ROWS)}%`,
							width: dropSize,
						}}
					/>
				))}
			</div>
			<p
				className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-serif text-[9vmin] text-background italic opacity-0"
				data-hello
			>
				hi.
			</p>
		</div>
	);
}
