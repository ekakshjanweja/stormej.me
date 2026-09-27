import type { BackgroundProps } from "./types";

/** Three soft bands sweep independently across the reading column. */
export function Ribbons({ still }: BackgroundProps) {
	return (
		<div className="fx-ribbons" data-still={still || undefined}>
			<span />
			<span />
			<span />
		</div>
	);
}
