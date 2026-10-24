"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { useRef } from "react";
import { Columns, CURTAIN_LAYER, FROM_CENTRE } from "./columns";
import { pageIntro } from "./page-intro";

gsap.registerPlugin(useGSAP, ScrambleTextPlugin);

/** the ones wheel spins through every value on the way to 100 */
const ONES = Array.from({ length: 101 }, (_, i) => i % 10);
const TENS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
const HUNDREDS = [0, 1];
const LOG = [
	"work/bullzeye",
	"work/fpv-labs",
	"work/digital-domi",
	"projects/lumen",
	"projects/burrow",
	"projects/aarthiq",
	"projects/turi",
	"blog",
	"contributions",
];

/** stop-start progress, like a real network: bursts, stalls, a sprint home */
const PROGRESS = [
	{ duration: 0.55, ease: "power3.out", value: 18 },
	{ duration: 0.35, ease: "power1.inOut", value: 24 },
	{ duration: 0.6, ease: "expo.inOut", value: 63 },
	{ duration: 0.3, ease: "power1.inOut", value: 71 },
	{ duration: 0.55, ease: "expo.in", value: 100 },
];

/** a click or a key press while it plays hurries it along */
const HURRY = 4;

function Wheel({ digits, name }: { digits: number[]; name: string }) {
	return (
		<span className="inline-block h-[0.8em] overflow-hidden">
			<span className="block text-center" data-wheel={name}>
				{digits.map((digit, i) => (
					<span
						className="block h-[0.8em] leading-[0.8]"
						// biome-ignore lint/suspicious/noArrayIndexKey: a fixed strip of repeating digits
						key={i}
					>
						{digit}
					</span>
				))}
			</span>
		</span>
	);
}

interface CurtainIntroProps {
	/** the columns have closed over whatever was under them */
	onCovered?: () => void;
	/** the curtain has fully let go of the page */
	onDone: () => void;
}

/**
 * The first visit: ink columns and an odometer. A serif counter rolls to
 * 100 in fits and starts while the pages it's "fetching" tick by, then the
 * columns lift out from the middle and the home page rises in underneath.
 */
export function CurtainIntro({ onCovered, onDone }: CurtainIntroProps) {
	const root = useRef<HTMLDivElement>(null);

	useGSAP(
		() => {
			const q = gsap.utils.selector(root);
			const [ones] = q("[data-wheel='ones']");
			const [tens] = q("[data-wheel='tens']");
			const [hundreds] = q("[data-wheel='hundreds']");
			const [bar] = q("[data-bar]");
			const [percent] = q("[data-percent]");
			const count = { value: 0 };
			/* render runs every frame, so quick setters rather than a gsap.set()
			   tween per wheel per frame */
			const setOnes = gsap.quickSetter(ones ?? [], "yPercent");
			const setTens = gsap.quickSetter(tens ?? [], "yPercent");
			const setHundreds = gsap.quickSetter(hundreds ?? [], "yPercent");
			const setBar = gsap.quickSetter(bar ?? [], "scaleX");

			/* the tens and hundreds only roll while the ones wheel wraps */
			const render = () => {
				const v = count.value;
				const carry = gsap.utils.clamp(0, 1, (v % 10) - 9);
				setOnes((-v / ONES.length) * 100);
				setTens((-(Math.floor(v / 10) + carry) / TENS.length) * 100);
				setHundreds((-gsap.utils.clamp(0, 1, v - 99) / HUNDREDS.length) * 100);
				setBar(v / 100);
				if (percent) {
					percent.textContent = `${Math.round(v)}`.padStart(3, "0");
				}
			};

			const tl = gsap.timeline({ onComplete: onDone });

			tl.from(q("[data-col]"), {
				duration: 0.9,
				ease: "expo.out",
				stagger: FROM_CENTRE,
				yPercent: 100,
			})
				.call(() => onCovered?.(), [], ">")
				.from(
					q("[data-counter]"),
					{ duration: 1, ease: "expo.out", yPercent: 100 },
					0.35
				)
				.from(
					q("[data-chrome]"),
					{ duration: 0.8, ease: "expo.out", opacity: 0, stagger: 0.06, y: 12 },
					0.4
				)
				.to(
					q("[data-tagline]"),
					{
						duration: 1.2,
						ease: "none",
						scrambleText: {
							chars: "abcdefghijklmnopqrstuvwxyz·",
							revealDelay: 0.3,
							text: "product · mobile · ai",
						},
					},
					0.5
				);

			const counting = gsap.timeline({ onUpdate: render });
			for (const step of PROGRESS) {
				counting.to(count, step);
			}
			tl.add(counting, 0.6);

			/* the log fills in as the counter climbs */
			tl.from(
				q("[data-log] li"),
				{
					duration: 0.25,
					ease: "power2.out",
					opacity: 0,
					stagger: counting.duration() / LOG.length,
					x: -10,
				},
				0.7
			);

			/* at 100: a beat, then everything inside the curtain drops away */
			tl.to(
				q("[data-counter]"),
				{ duration: 0.7, ease: "expo.in", yPercent: -110 },
				">+=0.15"
			)
				.to(
					q("[data-chrome], [data-log]"),
					{ duration: 0.4, ease: "power2.in", opacity: 0, y: -10 },
					"<0.2"
				)
				.set(root.current, { pointerEvents: "none" })
				.to(q("[data-col]"), {
					duration: 1.15,
					ease: "expo.inOut",
					stagger: { ...FROM_CENTRE, each: 0.055 },
					yPercent: -100,
				})
				.add(pageIntro(), "<0.45");

			const hurry = () => tl.timeScale(HURRY);
			window.addEventListener("pointerdown", hurry, { once: true });
			window.addEventListener("keydown", hurry, { once: true });
			return () => {
				window.removeEventListener("pointerdown", hurry);
				window.removeEventListener("keydown", hurry);
			};
		},
		{ scope: root }
	);

	return (
		<div aria-hidden className={CURTAIN_LAYER} ref={root}>
			<Columns />

			<div className="absolute inset-0 text-background">
				<div className="flex items-start justify-between p-5 sm:p-8">
					<p className="text-[15px] tracking-tight" data-chrome>
						ekaksh janweja
					</p>
					<p
						className="font-mono text-[11px] uppercase tracking-[0.18em] opacity-70"
						data-chrome
						data-tagline
					>
						&nbsp;
					</p>
				</div>

				<ul
					className="absolute top-24 right-5 space-y-1 text-right font-mono text-[11px] opacity-60 sm:right-8"
					data-log
				>
					{LOG.map((line) => (
						<li key={line}>
							<span className="opacity-50">get</span> /{line}
						</li>
					))}
				</ul>

				<div className="absolute right-5 bottom-5 left-5 sm:right-8 sm:bottom-8 sm:left-8">
					<div className="flex items-end justify-between gap-6">
						<div className="overflow-hidden">
							<div
								className="flex font-serif text-[clamp(120px,28vw,440px)] tabular-nums leading-[0.8] tracking-[-0.04em]"
								data-counter
							>
								<Wheel digits={HUNDREDS} name="hundreds" />
								<Wheel digits={TENS} name="tens" />
								<Wheel digits={ONES} name="ones" />
							</div>
						</div>
						<p
							className="pb-2 font-mono text-[11px] tabular-nums opacity-70"
							data-chrome
						>
							<span data-percent>000</span> / 100
						</p>
					</div>
					<div className="mt-5 h-px w-full bg-background/20" data-chrome>
						<div
							className="h-full origin-left scale-x-0 bg-background"
							data-bar
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
