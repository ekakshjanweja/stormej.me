import type { BackgroundProps } from "./types";

/** Slowly turning conic light field, styled in design-motion.css. */
export function Plasma({ still }: BackgroundProps) {
	return <div className="fx-plasma" data-still={still || undefined} />;
}
