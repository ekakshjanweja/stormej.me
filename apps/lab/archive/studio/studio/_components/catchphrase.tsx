"use client";

import { useEffect, useRef } from "react";
import { CATCHPHRASE } from "../_lib/content";
import { gsap, reducedMotion, SplitText } from "../_lib/gsap";

/* one big line that holds the middle of the screen. its lines rise from
   below, last line first, growing from 0.75 as they come */

export function Catchphrase() {
	const sectionRef = useRef<HTMLElement>(null);
	const titleRef = useRef<HTMLHeadingElement>(null);

	useEffect(() => {
		const section = sectionRef.current;
		const title = titleRef.current;
		if (!(section && title) || reducedMotion()) {
			return;
		}
		const split = SplitText.create(title, {
			aria: "auto",
			autoSplit: true,
			linesClass: "catch-line",
			onSplit: (self) => {
				const lines = [...self.lines].reverse();
				const timeline = gsap.timeline({
					scrollTrigger: {
						end: "center center",
						scrub: 0,
						start: "top 75%",
						trigger: section,
					},
				});
				timeline.fromTo(
					title,
					{ yPercent: -50 },
					{ duration: 1, ease: "expo.out", yPercent: 0 },
					0
				);
				lines.forEach((line, index) => {
					timeline.fromTo(
						line,
						{ opacity: 0, scale: 0.75 },
						{ duration: 0.7, ease: "power4.out", opacity: 1, scale: 1 },
						index * 0.05
					);
					timeline.fromTo(
						line,
						{ yPercent: 200 },
						{ duration: 0.9, ease: "power4.out", yPercent: 0 },
						index * 0.025
					);
				});
				return timeline;
			},
			type: "lines",
		});
		return () => split.revert();
	}, []);

	return (
		<section aria-labelledby="catch-title" className="catch" ref={sectionRef}>
			<div className="catch-sticky">
				<h2 className="catch-title" id="catch-title" ref={titleRef}>
					{CATCHPHRASE}
				</h2>
			</div>
		</section>
	);
}
