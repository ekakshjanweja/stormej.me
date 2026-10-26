"use client";

import { type Ref, useImperativeHandle, useRef } from "react";
import { gsap } from "../_lib/gsap";
import { setPhase } from "../_lib/phase";

export interface CurtainHandle {
	cover: (label: string) => Promise<void>;
	reveal: () => Promise<void>;
}

/* one quadratic edge, eight numbers in every shape so gsap can tween the
   path string. the cover rises from the bottom with its middle leading;
   the reveal lifts away upward with its middle lagging */
const FLAT_BOTTOM = "M0 100 V100 Q50 100 100 100 V100 z";
const BULGE_UP = "M0 100 V50 Q50 0 100 50 V100 z";
const FULL_FROM_BOTTOM = "M0 100 V0 Q50 0 100 0 V100 z";
const FULL_FROM_TOP = "M0 0 V100 Q50 100 100 100 V0 z";
const SAG_DOWN = "M0 0 V50 Q50 100 100 50 V0 z";
const FLAT_TOP = "M0 0 V0 Q50 0 100 0 V0 z";

export function Curtain({ ref }: { ref: Ref<CurtainHandle> }) {
	const rootRef = useRef<HTMLDivElement>(null);
	const pathRef = useRef<SVGPathElement>(null);
	const wordRef = useRef<HTMLSpanElement>(null);
	const ruleRef = useRef<HTMLSpanElement>(null);

	useImperativeHandle(ref, () => ({
		cover: (label) =>
			new Promise<void>((resolve) => {
				const word = wordRef.current;
				if (word) {
					word.textContent = label;
				}
				gsap
					.timeline({ onComplete: resolve })
					.set(rootRef.current, { visibility: "visible" })
					.set(pathRef.current, { attr: { d: FLAT_BOTTOM } })
					.set(word, { yPercent: 110 })
					.set(ruleRef.current, { scaleX: 0 })
					.to(pathRef.current, {
						attr: { d: BULGE_UP },
						duration: 0.5,
						ease: "power4.in",
					})
					.to(pathRef.current, {
						attr: { d: FULL_FROM_BOTTOM },
						duration: 0.25,
						ease: "power2.out",
					})
					.to(word, { duration: 0.6, ease: "power3.out", yPercent: 0 }, 0.6)
					.to(
						ruleRef.current,
						{ duration: 0.6, ease: "power3.inOut", scaleX: 1 },
						0.65
					);
			}),
		reveal: () =>
			new Promise<void>((resolve) => {
				gsap
					.timeline({
						onComplete: () => {
							gsap.set(rootRef.current, { visibility: "hidden" });
							resolve();
						},
					})
					.to(wordRef.current, {
						duration: 0.35,
						ease: "power3.in",
						yPercent: -110,
					})
					.to(ruleRef.current, { duration: 0.3, opacity: 0 }, 0)
					.set(pathRef.current, { attr: { d: FULL_FROM_TOP } })
					.call(() => setPhase("ready"))
					.to(pathRef.current, {
						attr: { d: SAG_DOWN },
						duration: 0.25,
						ease: "sine.in",
					})
					.to(pathRef.current, {
						attr: { d: FLAT_TOP },
						duration: 0.75,
						ease: "power4.out",
					})
					.set(ruleRef.current, { opacity: 1 });
			}),
	}));

	return (
		<div aria-hidden="true" className="curtain" ref={rootRef}>
			<svg aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 100 100">
				<path d={FLAT_BOTTOM} ref={pathRef} />
			</svg>
			<div className="curtain-label">
				<span className="curtain-mask">
					<span className="curtain-word" ref={wordRef} />
				</span>
				<span className="curtain-rule" ref={ruleRef} />
			</div>
		</div>
	);
}
