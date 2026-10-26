"use client";

import { type CSSProperties, type ReactNode, useEffect, useRef } from "react";
import { PAPER_PALETTE } from "../_lib/fluid";
import { gsap, reducedMotion } from "../_lib/gsap";
import { FluidCanvas } from "./fluid-canvas";

/* the card at the top of every inner page: the home hero's fluid, drawing
   this page's title, on the page's one webgl context. the real h1 stays in
   the dom for screen readers, zoom and search, and comes back whenever the
   shader can't draw it (touch, reduced motion, forced colours, a lost gpu).
   as the card scrolls away its contents sink, like the home hero */

interface PageHeroProps {
	/** text under the title */
	children?: ReactNode;
	className?: string;
	eyebrow: ReactNode;
	/** the bottom row: facts, links */
	foot?: ReactNode;
	title: string;
}

const SPACES = /\s+/;

/** the longest word sets a ceiling on the size, so it never has to break */
const longestWord = (title: string) =>
	Math.max(...title.split(SPACES).map((word) => word.length));

export function PageHero({
	children,
	className,
	eyebrow,
	foot,
	title,
}: PageHeroProps) {
	const sectionRef = useRef<HTMLElement>(null);
	const titleRef = useRef<HTMLHeadingElement>(null);
	const masks = useRef([titleRef]).current;

	useEffect(() => {
		const section = sectionRef.current;
		if (!section || reducedMotion()) {
			return;
		}
		const context = gsap.context(() => {
			gsap.to([".page-hero-inner", ".page-hero-fluid"], {
				ease: "none",
				scrollTrigger: {
					end: "bottom top",
					scrub: 0,
					start: "top top",
					trigger: section,
				},
				y: () => window.innerHeight * 0.3,
			});
		}, section);
		return () => context.revert();
	}, []);

	return (
		<section
			aria-labelledby="page-title"
			className={`page-hero ${className ?? ""}`}
			ref={sectionRef}
		>
			<FluidCanvas
				className="page-hero-fluid"
				masks={masks}
				palette={PAPER_PALETTE}
			/>
			<div className="page-hero-inner">
				<div className="page-hero-eyebrow">{eyebrow}</div>
				<h1
					className="page-hero-title"
					id="page-title"
					ref={titleRef}
					style={{ "--chars": longestWord(title) } as CSSProperties}
				>
					{title}
				</h1>
				{children ? <div className="page-hero-text">{children}</div> : null}
				{foot ? <div className="page-hero-foot">{foot}</div> : null}
			</div>
		</section>
	);
}
