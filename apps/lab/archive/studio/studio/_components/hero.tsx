"use client";

import { useEffect, useRef } from "react";
import { FACTS, HERO, TEAMS } from "../_lib/content";
import { PAPER_PALETTE } from "../_lib/fluid";
import { gsap, reducedMotion } from "../_lib/gsap";
import { FluidCanvas } from "./fluid-canvas";
import { StudioLink } from "./studio-link";

/* the card at the top: a fluid that draws the headline, and as the card
   scrolls away its contents sink at half the scroll speed */

export function Hero() {
	const sectionRef = useRef<HTMLElement>(null);
	const titleRef = useRef<HTMLHeadingElement>(null);
	const masks = useRef([titleRef]).current;

	useEffect(() => {
		const section = sectionRef.current;
		if (!section || reducedMotion()) {
			return;
		}
		const context = gsap.context(() => {
			gsap.to([".hero-inner", ".hero-fluid"], {
				ease: "none",
				scrollTrigger: {
					end: "bottom top",
					scrub: 0,
					start: "top top",
					trigger: section,
				},
				y: () => window.innerHeight * 0.5,
			});
		}, section);
		return () => context.revert();
	}, []);

	return (
		<section
			aria-labelledby="hero-title"
			className="hero"
			id="top"
			ref={sectionRef}
		>
			<FluidCanvas
				className="hero-fluid"
				masks={masks}
				palette={PAPER_PALETTE}
			/>
			<div className="hero-inner">
				<ul aria-label="at a glance" className="hero-facts">
					{FACTS.map((fact) => (
						<li key={fact}>{fact}</li>
					))}
				</ul>
				<h1 className="hero-title" id="hero-title" ref={titleRef}>
					{HERO.title}
				</h1>
				<p className="hero-text">{HERO.text}</p>
				<div className="hero-teams">
					<p className="hero-teams-label">{HERO.teamsLabel}</p>
					<ul className="hero-teams-list">
						{TEAMS.map((team) => (
							<li key={team.slug}>
								<StudioLink href={team.href}>{team.name}</StudioLink>
							</li>
						))}
					</ul>
				</div>
			</div>
		</section>
	);
}
