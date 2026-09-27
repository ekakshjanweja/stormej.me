const WHITESPACE = /(\s+)/;

export interface TextPiece {
	/** stable across renders of the same text, for react keys */
	id: string;
	/** true for the runs of whitespace between words */
	space: boolean;
	value: string;
}

/** a sentence as words and the whitespace between them, so it still wraps */
export function splitWords(text: string): TextPiece[] {
	const pieces: TextPiece[] = [];
	let offset = 0;
	for (const value of text.split(WHITESPACE)) {
		if (value) {
			pieces.push({ id: `${offset}`, space: WHITESPACE.test(value), value });
		}
		offset += value.length;
	}
	return pieces;
}

/** user-perceived characters, so emoji and accents aren't torn apart */
export const splitCharacters = (word: string) => Array.from(word);

export interface TextTiming {
	/** seconds before the first word or letter starts */
	delay: number;
	/** seconds a single word or letter takes, before the speed multiplier */
	duration: number;
	/** seconds between one section and the next, from the motion feel */
	stagger: number;
}

/**
 * Seconds between one piece and the next: the feel's stagger, squeezed so a
 * long headline never takes more than `cap` times the feel's duration.
 */
export const pieceStep = (
	timing: TextTiming,
	count: number,
	share: number,
	cap: number
) =>
	Math.min(
		timing.stagger * share,
		(timing.duration * cap) / Math.max(count, 1)
	);
