"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { useRef } from "react";
import { Columns, CURTAIN_LAYER, FROM_CENTRE } from "./columns";
import { contentIntro } from "./page-intro";

gsap.registerPlugin(useGSAP, ScrambleTextPlugin);

/* the intro takes its time once; between pages the curtain is quick: about
   a third of a second to close, a second all told when the page is ready */

/** how long the columns take to close, and to lift */
const CLOSE = 0.32;
const LIFT = 0.45;
/** the columns go one after another from the middle, this far apart */
const STAGGER = { ...FROM_CENTRE, each: 0.02 };
/** seconds into the curtain before it may lift: just long enough for the
 *  destination's name to land */
const SHOWN_FOR = 0.5;
/** seconds into the reveal when the columns start to lift */
const LIFT_AT = 0.12;
/** how far, in % of its own height, the name slides to clear its mask: past
 *  the serif's descenders on one line or two */
const SLIDE = 150;

/** "/work/digital-domi" → "digital domi"; the home page is "home" */
export function curtainLabel(path: string): string {
	const last = path.split("/").filter(Boolean).pop();
	if (!last) {
		return "home";
	}
	try {
		return decodeURIComponent(last).replaceAll("-", " ").toLowerCase();
	} catch {
		return last.replaceAll("-", " ").toLowerCase();
	}
}

interface CurtainTransitionProps {
	/** the columns have closed: navigate now */
	onCovered: () => void;
	/** the curtain has fully let go of the page */
	onDone: () => void;
	/** where we're going, e.g. "/work/bullzeye" */
	path: string;
	/** the new page has rendered under the curtain */
	ready: boolean;
}

/**
 * Between pages, the curtain at speed: the ink columns snap up over the
 * page, the destination's name flicks up in the serif with a request line
 * beside it, the route changes underneath, then the columns lift away and
 * the new page's blocks rise in.
 */
export function CurtainTransition({
	onCovered,
	onDone,
	path,
	ready,
}: CurtainTransitionProps) {
	const root = useRef<HTMLDivElement>(null);
	const cover = useRef<gsap.core.Timeline | null>(null);
	const label = curtainLabel(path);

	useGSAP(
		() => {
			const q = gsap.utils.selector(root);
			cover.current = gsap
				.timeline()
				.from(q("[data-col]"), {
					duration: CLOSE,
					ease: "power3.inOut",
					stagger: STAGGER,
					yPercent: 100,
				})
				/* closed: the route can change behind it while the name comes up */
				.call(onCovered, [], ">")
				.from(
					q("[data-label]"),
					{ duration: 0.4, ease: "expo.out", yPercent: SLIDE },
					0.12
				)
				.from(
					q("[data-chrome]"),
					{ duration: 0.3, ease: "expo.out", opacity: 0, stagger: 0.03, y: 8 },
					0.1
				)
				/* the bar creeps while the page loads; it can't know how long */
				.to(
					q("[data-bar]"),
					{ duration: 0.9, ease: "power2.out", scaleX: 0.7 },
					0.1
				);
		},
		{ scope: root }
	);

	useGSAP(
		() => {
			if (!ready) {
				return;
			}
			const q = gsap.utils.selector(root);
			const shown = cover.current?.time() ?? SHOWN_FOR;
			/* the bar completes, the name leaves and the columns lift, overlapping */
			gsap
				.timeline({ delay: Math.max(0, SHOWN_FOR - shown), onComplete: onDone })
				.to(
					q("[data-bar]"),
					{ duration: 0.15, ease: "power2.out", overwrite: true, scaleX: 1 },
					0
				)
				.to(
					q("[data-status]"),
					{
						duration: 0.15,
						ease: "none",
						scrambleText: { chars: "0123456789", text: "200 ok" },
					},
					0
				)
				.to(
					q("[data-label]"),
					{ duration: 0.25, ease: "power3.in", yPercent: -SLIDE },
					0.04
				)
				.to(
					q("[data-chrome]"),
					{ duration: 0.2, ease: "power2.in", opacity: 0, y: -8 },
					0.06
				)
				.set(root.current, { pointerEvents: "none" }, LIFT_AT)
				.to(
					q("[data-col]"),
					{
						duration: LIFT,
						ease: "power3.inOut",
						stagger: STAGGER,
						yPercent: -100,
					},
					LIFT_AT
				)
				.add(contentIntro(), LIFT_AT + 0.15);
		},
		{ dependencies: [ready], scope: root }
	);

	/* long names step down in size so they still fit, and may wrap */
	const size = `clamp(44px, min(20vw, ${Math.floor(170 / label.length)}vw), 300px)`;

	return (
		<div aria-hidden className={CURTAIN_LAYER} ref={root}>
			<Columns />

			<div className="absolute inset-0 text-background">
				<div className="flex items-start justify-between gap-6 p-5 sm:p-8">
					<p className="text-[15px] tracking-tight" data-chrome>
						ekaksh janweja
					</p>
					<p className="truncate font-mono text-[11px] opacity-70" data-chrome>
						<span className="opacity-50">get</span> {path}
					</p>
				</div>

				<div className="absolute right-5 bottom-5 left-5 sm:right-8 sm:bottom-8 sm:left-8">
					<div className="flex items-end justify-between gap-6">
						{/* room above and below for the serif's ascenders and
						    descenders, given back with the negative margin */}
						<div className="-mb-[0.24em] min-w-0 overflow-hidden pt-[0.1em] pb-[0.3em]">
							<p
								className="text-balance font-serif leading-[0.85] tracking-[-0.03em]"
								data-label
								style={{ fontSize: size }}
							>
								{label}
							</p>
						</div>
						<p
							className="shrink-0 pb-2 font-mono text-[11px] uppercase tracking-[0.18em] opacity-70"
							data-chrome
							data-status
						>
							···
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
