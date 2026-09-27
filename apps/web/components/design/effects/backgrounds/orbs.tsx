// adapted from motion-primitives' glow-effect (motion-primitives.com)
import type { BackgroundProps } from "./types";

const ORBS = ["one", "two", "three", "four"] as const;

/** blurred accent blobs on slow drifts; styled in app/design-motion.css */
export function Orbs({ still }: BackgroundProps) {
	return (
		<div className="fx-orbs" data-still={still || undefined}>
			{ORBS.map((orb) => (
				<span className="fx-orb" data-orb={orb} key={orb} />
			))}
		</div>
	);
}
