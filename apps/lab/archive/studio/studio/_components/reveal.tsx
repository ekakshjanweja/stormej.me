"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { gsap, reducedMotion, ScrollTrigger } from "../_lib/gsap";

/* lifts anything marked data-reveal as it scrolls into view, once: a short
   rise out of a clip, staggered by row. nothing is hidden before the script
   runs, so the page reads fine without it, and reduced motion skips it */

export function Reveal({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	const rootRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const root = rootRef.current;
		if (!root || reducedMotion()) {
			return;
		}
		const items = gsap.utils.toArray<HTMLElement>("[data-reveal]", root);
		/* things already on screen when the page arrives stay as they are */
		const below = items.filter(
			(item) => item.getBoundingClientRect().top > window.innerHeight * 0.92
		);
		if (below.length === 0) {
			return;
		}
		gsap.set(below, { clipPath: "inset(0% 0% 100% 0%)", opacity: 0, y: 40 });
		const batch = ScrollTrigger.batch(below, {
			once: true,
			onEnter: (entered) =>
				gsap.to(entered, {
					clipPath: "inset(0% 0% 0% 0%)",
					duration: 0.9,
					ease: "expo.out",
					onComplete: () => gsap.set(entered, { clearProps: "clipPath" }),
					opacity: 1,
					stagger: 0.06,
					y: 0,
				}),
			start: "top 92%",
		});
		return () => {
			for (const trigger of batch) {
				trigger.kill();
			}
			gsap.set(below, { clearProps: "clipPath,opacity,transform" });
		};
	}, []);

	return (
		<div className={className} ref={rootRef}>
			{children}
		</div>
	);
}
