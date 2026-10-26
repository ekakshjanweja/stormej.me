"use client";

import Link from "next/link";
import { type SyntheticEvent, useCallback } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { type Card, isExternal, toneFor } from "../_lib/content";
import { CardFace } from "./ring";

/* a few cards hung on a short stretch of the ring's wall, in a page's sky.
   nothing turns: the curve is set once in css, and a card leans toward you
   when it's pointed at or focused */

interface ArcProps {
	cards: Card[];
	/** the cards only decorate; the same things are linked further down */
	decorative?: boolean;
	/** names the list for screen readers */
	label: string;
}

const cursorFor = (card: Card) => {
	if (card.href.startsWith("#")) {
		return "play";
	}
	return card.kind === "reel" || card.kind === "clip" ? "play" : "open";
};

export function Arc({ cards, decorative = false, label }: ArcProps) {
	const playPreview = useCallback((event: SyntheticEvent<HTMLElement>) => {
		const video = event.currentTarget.querySelector("video");
		if (!video || prefersReducedMotion()) {
			return;
		}
		if (!video.src && video.dataset.src) {
			video.src = video.dataset.src;
		}
		video.play().catch(() => {
			/* autoplay can be refused; the poster stays */
		});
	}, []);

	const stopPreview = useCallback((event: SyntheticEvent<HTMLElement>) => {
		event.currentTarget.querySelector("video")?.pause();
	}, []);

	const middle = (cards.length - 1) / 2;

	return (
		<div aria-hidden={decorative || undefined} className="arc">
			<ul aria-label={decorative ? undefined : label} className="arc-wall">
				{cards.map((card, index) => {
					const tone = toneFor(card.world);
					const external = isExternal(card.href);
					const face = (
						<span className="card-tilt">
							<span aria-hidden className="card-frame" />
							<span className="card-face">
								<CardFace card={card} />
								<span aria-hidden className="card-tag">
									{card.tag}
								</span>
								<span aria-hidden className="card-label">
									<b>{tone.label}</b>
									<span>{card.title}</span>
									<i>{external ? "↗" : "→"}</i>
								</span>
							</span>
						</span>
					);
					return (
						<li
							className="arc-slot"
							key={card.id}
							style={
								{
									"--a": index - middle,
									"--on": tone.on,
									"--world": tone.color,
								} as React.CSSProperties
							}
						>
							{decorative ? (
								<span className="hang" data-kind={card.kind}>
									{face}
								</span>
							) : (
								<Link
									aria-label={`${card.title}, ${card.tag}${external ? " (opens in a new tab)" : ""}`}
									className="hang"
									data-cursor={cursorFor(card)}
									data-kind={card.kind}
									draggable={false}
									href={card.href}
									onBlur={stopPreview}
									onFocus={playPreview}
									onPointerEnter={playPreview}
									onPointerLeave={stopPreview}
									rel={external ? "noopener noreferrer" : undefined}
									target={external ? "_blank" : undefined}
								>
									{face}
								</Link>
							)}
						</li>
					);
				})}
			</ul>
		</div>
	);
}
