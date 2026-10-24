/** the curtain is this many ink columns, lifting out from the middle */
export const COLUMNS = 7;

/** a full-screen layer above the navbar and the page */
export const CURTAIN_LAYER = "fixed inset-0 z-[200] overflow-hidden";

/** the stagger every curtain move shares: out from the middle column */
export const FROM_CENTRE = { each: 0.05, from: "center" } as const;

/**
 * The ink columns. Each runs a couple of pixels into the next, so no
 * hairline of page shows between them.
 */
export function Columns() {
	return Array.from({ length: COLUMNS }, (_, i) => (
		<div
			className="absolute inset-y-0 bg-foreground will-change-transform"
			data-col
			// biome-ignore lint/suspicious/noArrayIndexKey: identical columns
			key={i}
			style={{
				left: `${(i / COLUMNS) * 100}%`,
				width: `calc(${100 / COLUMNS}% + 2px)`,
			}}
		/>
	));
}
