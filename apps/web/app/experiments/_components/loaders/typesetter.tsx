"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useRef } from "react";
import { pageIntro } from "@/components/curtain/page-intro";
import { COVER, type LoaderProps } from "./types";

gsap.registerPlugin(useGSAP, SplitText);

const HEADLINE =
	"early-stage engineer building products from idea to production.";
const WORDS = HEADLINE.split(" ");
/** every face the site already ships, so the roulette costs no downloads */
const FONTS = [
	"var(--font-instrument-serif)",
	"var(--font-geist-sans)",
	"var(--font-geist-mono)",
	"var(--font-garamond)",
	"var(--font-space-mono)",
	"var(--font-handjet)",
];
/** seconds between font flips while the roulette runs */
const FLIP_EVERY = 0.07;

interface Box {
	height: number;
	left: number;
	top: number;
	width: number;
}

const box = (el: Element): Box => {
	const { height, left, top, width } = el.getBoundingClientRect();
	return { height, left, top, width };
};

/** one pull of the slot machine: a new face, sometimes slanted, set in
 *  capitals or in the accent */
function spin(word: HTMLElement) {
	const { style } = word;
	style.fontFamily = gsap.utils.random(FONTS);
	style.fontStyle = Math.random() < 0.3 ? "italic" : "normal";
	style.textTransform = Math.random() < 0.18 ? "uppercase" : "none";
	style.color = Math.random() < 0.12 ? "var(--highlight)" : "inherit";
}

/**
 * The hero headline set huge, every word flicking through the site's six
 * typefaces like a slot machine. It locks to the serif, blows apart, then
 * each word flies into its exact place in the real heading below.
 */
export function Typesetter({ onDone }: LoaderProps) {
	const root = useRef<HTMLDivElement>(null);

	useGSAP(
		(_context, contextSafe) => {
			let alive = true;
			let rolling = false;
			let lastFlip = 0;
			const q = gsap.utils.selector(root);
			const words = q<HTMLElement>("[data-word]");
			const [line] = q<HTMLElement>("[data-line]");

			const flip = (time: number) => {
				if (!rolling || time - lastFlip < FLIP_EVERY) {
					return;
				}
				lastFlip = time;
				for (const word of words) {
					/* about a third of the words hold still each flip */
					if (Math.random() >= 0.35) {
						spin(word);
					}
				}
			};

			const build = contextSafe?.(() => {
				/* a run torn down while fonts loaded (strict mode mounts twice) */
				if (!alive) {
					return;
				}
				const heading = document.getElementById("hero-heading");
				if (!(heading && line)) {
					onDone();
					return;
				}

				/* the big line takes on the heading's face, leading and tracking,
				   so a word scaled down by the size ratio lands glyph for glyph */
				const hs = getComputedStyle(heading);
				const heroSize = Number.parseFloat(hs.fontSize);
				const leading = Number.parseFloat(hs.lineHeight) / heroSize;
				const tracking = (Number.parseFloat(hs.letterSpacing) || 0) / heroSize;
				gsap.set(line, {
					fontFamily: hs.fontFamily,
					letterSpacing: `${tracking}em`,
					lineHeight: leading,
				});
				const bigSize = Number.parseFloat(getComputedStyle(line).fontSize);
				const scale = heroSize / bigSize;

				const split = SplitText.create(heading, { type: "words" });
				const from = words.map(box);
				const to = split.words.map(box);
				const vw = window.innerWidth;
				const vh = window.innerHeight;

				const tl = gsap.timeline({ onComplete: onDone });
				tl.set(heading, { autoAlpha: 0 }, 0);

				/* 1. words drop in and the roulette starts */
				tl.from(words, {
					duration: 0.7,
					ease: "back.out(2.2)",
					filter: "blur(14px)",
					opacity: 0,
					rotation: () => gsap.utils.random(-25, 25),
					scale: 0.4,
					stagger: { each: 0.06, from: "random" },
					yPercent: 80,
				})
					.call(
						() => {
							rolling = true;
						},
						[],
						0.15
					)
					.to(
						words,
						{
							duration: 0.12,
							ease: "power1.inOut",
							/* each word bobs on its own; a repeat outside the stagger
							   would replay the whole wave instead */
							stagger: { each: 0.03, from: "random", repeat: 9, yoyo: true },
							yPercent: () => gsap.utils.random(-14, 14),
						},
						0.7
					)
					/* 2. lock: back to the serif, one hard thunk */
					.call(
						() => {
							rolling = false;
							for (const word of words) {
								word.style.fontFamily = "";
								word.style.fontStyle = "";
								word.style.textTransform = "";
								word.style.color = "";
							}
						},
						[],
						">"
					)
					.fromTo(
						line,
						{ scale: 1.07 },
						{ duration: 0.5, ease: "elastic.out(1.2, 0.4)", scale: 1 },
						"<"
					)
					/* 3. blow apart */
					.to(
						words,
						{
							duration: 0.75,
							ease: "expo.out",
							rotation: () => gsap.utils.random(-50, 50),
							scale: () => gsap.utils.random(0.5, 1.5),
							stagger: { each: 0.015, from: "center" },
							x: (i) => {
								const b = from[i];
								return b
									? gsap.utils.random(0.12, 0.88) * vw - (b.left + b.width / 2)
									: 0;
							},
							y: (i) => {
								const b = from[i];
								return b
									? gsap.utils.random(0.15, 0.85) * vh - (b.top + b.height / 2)
									: 0;
							},
							yPercent: 0,
						},
						">+=0.15"
					)
					.set(root.current, { pointerEvents: "none" })
					/* 4. every word home, into the heading */
					.to(
						words,
						{
							duration: 1.15,
							ease: "expo.inOut",
							rotation: 0,
							scale,
							stagger: { each: 0.035, from: "random" },
							/* words scale about their centre, so land the scaled box's
							   corner, not the unscaled one */
							x: (i) => {
								const a = from[i];
								const b = to[i];
								return a && b
									? b.left - a.left - ((1 - scale) * a.width) / 2
									: 0;
							},
							y: (i) => {
								const a = from[i];
								const b = to[i];
								return a && b
									? b.top - a.top - ((1 - scale) * a.height) / 2
									: 0;
							},
						},
						">+=0.05"
					)
					.to(
						q("[data-paper]"),
						{ duration: 0.7, ease: "power2.inOut", opacity: 0 },
						"<0.3"
					)
					.add(pageIntro({ heading: false }), "<0.15")
					.set(heading, { autoAlpha: 1 })
					.set(words, { autoAlpha: 0 });
			});

			gsap.ticker.add(flip);
			document.fonts.ready.then(build);

			return () => {
				alive = false;
				gsap.ticker.remove(flip);
			};
		},
		{ scope: root }
	);

	return (
		<div aria-hidden className={COVER} ref={root}>
			<div className="absolute inset-0 bg-background" data-paper />
			<div className="absolute inset-0 flex items-center justify-center px-6">
				<p
					className="max-w-[11em] text-center text-[clamp(44px,8vw,120px)] text-foreground"
					data-line
				>
					{WORDS.map((word, i) => (
						<span key={word}>
							<span className="inline-block will-change-transform" data-word>
								{word}
							</span>
							{i < WORDS.length - 1 ? " " : null}
						</span>
					))}
				</p>
			</div>
		</div>
	);
}
