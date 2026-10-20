/**
 * Packs cards of different widths into full rows, keeping the given order as
 * far as it can: when the next card doesn't fit the space left in a row, the
 * first later card that does fit moves up (the same idea as CSS
 * `grid-auto-flow: dense`, but decided here so we know where every card lands).
 */

export interface Packed<T> {
	item: T;
	/** columns the card spans, after stretching to close a row */
	span: number;
}

export function packRows<T>(
	items: T[],
	columns: number,
	width: (item: T) => number
): Packed<T>[][] {
	const queue = [...items];
	const rows: Packed<T>[][] = [];

	while (queue.length > 0) {
		const row: Packed<T>[] = [];
		let left = columns;
		let index = queue.findIndex((item) => width(item) <= left);
		while (index !== -1) {
			const [item] = queue.splice(index, 1);
			const span = Math.min(width(item as T), columns);
			row.push({ item: item as T, span });
			left -= span;
			index = queue.findIndex((next) => width(next) <= left);
		}
		if (row.length === 0) {
			// a card wider than the grid: give it a row of its own
			const [item] = queue.splice(0, 1);
			row.push({ item: item as T, span: columns });
			left = 0;
		}
		// close the gap: the row's last card takes what is left
		const last = row.at(-1);
		if (last && left > 0) {
			last.span += left;
		}
		rows.push(row);
	}

	return rows;
}

/**
 * Like `packRows`, but a final row holding a single narrow card is left off
 * (it would have to stretch across the whole grid); those cards are still a
 * "view all" away.
 */
export function packFullRows<T>(
	items: T[],
	columns: number,
	width: (item: T) => number
): Packed<T>[][] {
	const rows = packRows(items, columns, width);
	const last = rows.at(-1);
	const lonely =
		rows.length > 1 &&
		last?.length === 1 &&
		last[0] !== undefined &&
		width(last[0].item) < columns;
	return lonely ? rows.slice(0, -1) : rows;
}
