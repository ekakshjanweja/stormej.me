"use client";

// adapted from aceternity's background-beams (ui.aceternity.com)
import { motion } from "framer-motion";
import { useId, useState } from "react";
import type { BackgroundProps } from "./types";

/** every other curve from the original fifty: the same sweep, half the work */
const BEAM_COUNT = 25;
const BEAM_SPACING = 14;

/** one of the original's parallel curves, shifted along the diagonal */
const beamPath = (index: number) => {
	const shift = index * BEAM_SPACING;
	const x = (value: number) => value + shift;
	const y = (value: number) => value - shift * (8 / 7);
	return `M${x(-380)} ${y(-189)}C${x(-380)} ${y(-189)} ${x(-312)} ${y(216)} ${x(152)} ${y(343)}C${x(616)} ${y(470)} ${x(684)} ${y(875)} ${x(684)} ${y(875)}`;
};

interface Beam {
	delay: number;
	duration: number;
	id: number;
	path: string;
	settle: number;
}

const createBeams = (): Beam[] =>
	Array.from({ length: BEAM_COUNT }, (_, id) => ({
		delay: Math.random() * 10,
		duration: 10 + Math.random() * 10,
		id,
		path: beamPath(id),
		settle: 93 + Math.random() * 8,
	}));

/** light running along a sheaf of curves; colours come from the palette */
export function Beams({ still }: BackgroundProps) {
	const prefix = useId();
	// client only (next/dynamic with ssr off), so random timings are safe
	const [beams] = useState(createBeams);

	return (
		<svg
			aria-hidden="true"
			className="fx-beams"
			fill="none"
			preserveAspectRatio="xMidYMid slice"
			viewBox="0 0 696 316"
		>
			{beams.map((beam) => (
				<path
					className="fx-beam-track"
					d={beam.path}
					key={`track-${beam.id}`}
					strokeWidth="0.5"
				/>
			))}
			{beams.map((beam) => (
				<path
					d={beam.path}
					key={`beam-${beam.id}`}
					stroke={`url(#${prefix}-${beam.id})`}
					strokeOpacity="0.5"
					strokeWidth="0.6"
				/>
			))}
			<defs>
				{beams.map((beam, index) =>
					still ? (
						<linearGradient
							id={`${prefix}-${beam.id}`}
							key={beam.id}
							x1={`${(index * 17) % 100}%`}
							x2={`${((index * 17) % 100) + 30}%`}
							y1={`${(index * 17) % 100}%`}
							y2={`${((index * 17) % 100) + 30}%`}
						>
							<BeamStops />
						</linearGradient>
					) : (
						<motion.linearGradient
							animate={{
								x1: ["0%", "100%"],
								x2: ["0%", "95%"],
								y1: ["0%", "100%"],
								y2: ["0%", `${beam.settle}%`],
							}}
							id={`${prefix}-${beam.id}`}
							initial={{ x1: "0%", x2: "0%", y1: "0%", y2: "0%" }}
							key={beam.id}
							transition={{
								delay: beam.delay,
								duration: beam.duration,
								ease: "easeInOut",
								repeat: Number.POSITIVE_INFINITY,
							}}
						>
							<BeamStops />
						</motion.linearGradient>
					)
				)}
			</defs>
		</svg>
	);
}

function BeamStops() {
	return (
		<>
			<stop className="fx-beam-stop" stopOpacity="0" />
			<stop className="fx-beam-stop" />
			<stop className="fx-beam-stop-mid" offset="32.5%" />
			<stop className="fx-beam-stop-end" offset="100%" stopOpacity="0" />
		</>
	);
}
