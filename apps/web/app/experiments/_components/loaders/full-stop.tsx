"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { useRef } from "react";
import { pageIntro } from "@/components/curtain/page-intro";
import { COVER, type LoaderProps } from "./types";

gsap.registerPlugin(useGSAP, ScrambleTextPlugin);

const HEAD = [..."stormej"];
const TAIL = [..."me"];

function Char({ char }: { char: string }) {
	/* the padding lets italic overhangs and the j's tail out of the clip;
	   the negative margin keeps the spacing as set */
	return (
		<span
			className="-mx-[0.08em] -mb-[0.14em] inline-block overflow-hidden px-[0.08em] pb-[0.14em]"
			data-mask
		>
			<span className="inline-block" data-char>
				{char}
			</span>
		</span>
	);
}

/**
 * The cover is ink and the letters are holes in it: "stormej.me" set in the
 * serif is a window onto the page. The letters bob, then fall off the
 * screen, leaving the full stop. It beats twice and we dive through it.
 */
export function FullStop({ onDone }: LoaderProps) {
	const root = useRef<HTMLDivElement>(null);

	useGSAP(
		() => {
			const q = gsap.utils.selector(root);
			const chars = q("[data-char]");
			const [dot] = q("[data-dot]");
			if (!dot) {
				return;
			}
			const vw = window.innerWidth;
			const vh = window.innerHeight;
			const d = dot.getBoundingClientRect();
			const toCentre = {
				x: vw / 2 - (d.left + d.width / 2),
				y: vh / 2 - (d.top + d.height / 2),
			};
			/* big enough that the dot's edge clears the far corners */
			const cover = (Math.hypot(vw, vh) / d.width) * 1.15;

			const tl = gsap.timeline({ onComplete: onDone });

			tl.from(chars, {
				duration: 1.1,
				ease: "expo.out",
				stagger: 0.055,
				yPercent: 115,
			})
				.from(dot, { duration: 0.7, ease: "back.out(3)", scale: 0 }, 0.55)
				.to(
					q("[data-caption]"),
					{
						duration: 1.4,
						ease: "none",
						scrambleText: {
							chars: "0123456789",
							text: "loading · 100%",
						},
					},
					0.3
				)
				/* a wave runs through the word */
				.to(
					chars,
					{
						duration: 0.26,
						ease: "sine.inOut",
						stagger: { each: 0.045, repeat: 1, yoyo: true },
						yPercent: -24,
					},
					1.35
				)
				/* gravity: everything but the full stop falls out of frame */
				.set(q("[data-mask]"), { overflow: "visible" }, ">")
				.to(
					chars,
					{
						duration: 0.95,
						ease: "power3.in",
						rotation: () => gsap.utils.random(-120, 120),
						stagger: { amount: 0.35, from: "random" },
						x: () => gsap.utils.random(-120, 120),
						y: () => vh * gsap.utils.random(0.9, 1.3),
					},
					">"
				)
				.to(q("[data-caption]"), { duration: 0.3, opacity: 0, y: 20 }, "<")
				.to(dot, { duration: 0.85, ease: "expo.inOut", ...toCentre }, "<0.4")
				/* lub-dub, lub-dub */
				.to(dot, {
					duration: 0.12,
					ease: "power2.out",
					repeat: 3,
					repeatDelay: 0.05,
					scale: 1.9,
					yoyo: true,
				})
				.set(root.current, { pointerEvents: "none" })
				.to(dot, { duration: 1.05, ease: "expo.in", scale: cover }, ">+=0.1")
				.add(pageIntro(), "<0.8");
		},
		{ scope: root }
	);

	return (
		<div
			aria-hidden
			className={`${COVER} bg-foreground mix-blend-multiply dark:mix-blend-screen`}
			ref={root}
		>
			{/* multiply: white shows the page untouched, ink stays ink (screen
			    does the same in dark mode with black) */}
			<div className="absolute inset-0 flex flex-col items-center justify-center text-white dark:text-black">
				<p className="whitespace-nowrap font-serif text-[clamp(84px,19vw,320px)] italic leading-none tracking-[-0.02em]">
					{HEAD.map((char, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: letters of a fixed word
						<Char char={char} key={`h${i}`} />
					))}
					<span
						className="mx-[0.05em] inline-block size-[0.15em] rounded-full bg-current will-change-transform"
						data-dot
					/>
					{TAIL.map((char, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: letters of a fixed word
						<Char char={char} key={`t${i}`} />
					))}
				</p>
				<p
					className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em]"
					data-caption
				>
					&nbsp;
				</p>
			</div>
		</div>
	);
}
