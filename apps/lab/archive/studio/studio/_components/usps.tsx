"use client";

import { useEffect, useRef } from "react";
import { USPS } from "../_lib/content";
import { gsap, reducedMotion } from "../_lib/gsap";
import { UspArt } from "./usp-art";

/* the markup is a plain list. with motion allowed it becomes a stage: the
   header holds the middle of the screen while each card tips up out of the
   floor (rotateX 90 → 0, z 750 → 0), the ones beneath shrink and darken,
   and at the end everything leaves upward */

const SHRINK = 0.125;
const FADE = 0.1;

const buildStage = (section: HTMLElement) => {
	const header = section.querySelector<HTMLElement>(".usps-header");
	const cards = gsap.utils.toArray<HTMLElement>(".usp-card", section);
	const vh = () => window.innerHeight;
	const timeline = gsap.timeline({
		scrollTrigger: {
			end: "bottom bottom",
			invalidateOnRefresh: true,
			scrub: 0,
			start: "top top",
			trigger: section,
		},
	});

	timeline.fromTo(
		header,
		{ y: () => vh() * 0.25 },
		{ duration: 2, ease: "power4.out", y: 0 },
		0
	);
	timeline.to(header, { duration: cards.length, ease: "none", scale: 0.85 }, 1);

	cards.forEach((card, index) => {
		const at = 1 + index;
		timeline.fromTo(
			card,
			{ y: () => vh() * 0.5 + card.offsetHeight },
			{ duration: 1.5, ease: "power2.inOut", y: 0 },
			at
		);
		timeline.fromTo(
			card,
			{ rotateX: 90, z: 750 },
			{ duration: 1.2, ease: "power2.inOut", rotateX: 0, z: 0 },
			at
		);
		/* everything already up sinks one level */
		cards.slice(0, index).forEach((below, belowIndex) => {
			const level = index - belowIndex;
			timeline.to(
				below,
				{ duration: 1.2, ease: "power2.inOut", scale: 1 - level * SHRINK },
				at
			);
			timeline.to(
				below.querySelector(".usp-fade"),
				{ duration: 1.2, ease: "power2.inOut", opacity: level * FADE },
				at
			);
		});
	});

	const exit = 1 + cards.length + 1;
	timeline.to(
		header,
		{ duration: 1.5, ease: "power2.in", scale: 0, y: () => -vh() * 0.5 },
		exit
	);
	timeline.to(
		cards,
		{
			duration: 1.5,
			ease: "power1.in",
			stagger: 0.075,
			y: () => -vh(),
		},
		exit
	);
	timeline.to(
		section.querySelector(".usps-stage"),
		{ duration: 0.8, ease: "none", opacity: 0 },
		exit + 1
	);
};

export function Usps() {
	const sectionRef = useRef<HTMLElement>(null);

	useEffect(() => {
		const section = sectionRef.current;
		if (!section || reducedMotion()) {
			return;
		}
		section.classList.add("is-staged");
		const context = gsap.context(() => buildStage(section), section);
		return () => {
			context.revert();
			section.classList.remove("is-staged");
		};
	}, []);

	return (
		<section aria-labelledby="usps-title" className="usps" ref={sectionRef}>
			<div className="usps-stage">
				<div className="usps-header">
					<h2 className="usps-title" id="usps-title">
						{USPS.title}
					</h2>
					<p className="usps-text">{USPS.text}</p>
				</div>
				<ol className="usps-cards">
					{USPS.cards.map((card) => (
						<li className="usp-card" key={card.title}>
							<div className="usp-card-art">
								<UspArt kind={card.art} />
							</div>
							<h3 className="usp-card-title">{card.title}</h3>
							<p className="usp-card-text">{card.text}</p>
							<span aria-hidden="true" className="usp-fade" />
						</li>
					))}
				</ol>
			</div>
		</section>
	);
}
