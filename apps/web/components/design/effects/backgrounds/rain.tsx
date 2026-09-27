import type { BackgroundProps } from "./types";

/** Fine lines drift diagonally behind a radial vignette. */
export function Rain({ still }: BackgroundProps) {
	return <div className="fx-rain" data-still={still || undefined} />;
}
