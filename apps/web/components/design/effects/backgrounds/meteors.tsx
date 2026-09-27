"use client";

// adapted from magic ui's meteors (magicui.design)
import { type CSSProperties, useState } from "react";
import type { BackgroundProps } from "./types";

const METEOR_COUNT = 16;
const MAX_DELAY_SECONDS = 9;
const MIN_DURATION_SECONDS = 4;
const MAX_DURATION_SECONDS = 10;
/** start anywhere across the top, and a little past the right edge */
const SPREAD_PERCENT = 130;

interface Meteor {
	id: number;
	style: CSSProperties;
}

const createMeteors = (): Meteor[] =>
	Array.from({ length: METEOR_COUNT }, (_, id) => ({
		id,
		style: {
			animationDelay: `${(Math.random() * MAX_DELAY_SECONDS).toFixed(2)}s`,
			animationDuration: `${(
				MIN_DURATION_SECONDS +
					Math.random() * (MAX_DURATION_SECONDS - MIN_DURATION_SECONDS)
			).toFixed(2)}s`,
			left: `${(Math.random() * SPREAD_PERCENT).toFixed(1)}%`,
			top: `${(Math.random() * 30 - 10).toFixed(1)}%`,
		},
	}));

/** streaks falling down-left across the page; styled in app/design-motion.css */
export function Meteors({ still }: BackgroundProps) {
	// only ever rendered on the client (next/dynamic with ssr off), so the
	// random layout can't mismatch a server render
	const [meteors] = useState(createMeteors);

	return (
		<div className="fx-meteors" data-still={still || undefined}>
			{meteors.map((meteor) => (
				<span className="fx-meteor" key={meteor.id} style={meteor.style} />
			))}
		</div>
	);
}
