// word and letter cascades after motion-primitives' text-effect and magic ui's text-animate
import type { CSSProperties } from "react";
import {
	pieceStep,
	splitCharacters,
	splitWords,
	type TextTiming,
} from "./split";

type CascadeMode = "blur" | "letters" | "mask";

const WORD_SHARE = 1;
const LETTER_SHARE = 0.35;
/** a headline's cascade never runs longer than this many feel durations */
const WORD_CAP = 2.5;
const LETTER_CAP = 2.5;

const delayStyle = (seconds: number): CSSProperties => ({
	animationDelay: `${seconds.toFixed(3)}s`,
});

/**
 * Splits the headline into words (and letters) that animate in one after
 * another. Pure markup: the motion is css keyframes in app/design-motion.css,
 * which start at first paint and fall back to plain text for reduced motion.
 * Whitespace stays as text between the words so the sentence wraps as usual.
 */
export function Cascade({
	mode,
	text,
	timing,
}: {
	mode: CascadeMode;
	text: string;
	timing: TextTiming;
}) {
	const pieces = splitWords(text);

	if (mode === "letters") {
		const letters = pieces.reduce(
			(total, piece) => (piece.space ? total : total + piece.value.length),
			0
		);
		const step = pieceStep(timing, letters, LETTER_SHARE, LETTER_CAP);
		let index = 0;
		return (
			<span className="fx-cascade" data-cascade={mode}>
				{pieces.map((piece) => {
					if (piece.space) {
						return piece.value;
					}
					const characters = splitCharacters(piece.value).map(
						(value, offset) => {
							const delay = timing.delay + index * step;
							index += 1;
							return { delay, id: `${piece.id}-${offset}`, value };
						}
					);
					return (
						<span className="fx-word" key={piece.id}>
							{characters.map((character) => (
								<span
									className="fx-letter"
									key={character.id}
									style={delayStyle(character.delay)}
								>
									{character.value}
								</span>
							))}
						</span>
					);
				})}
			</span>
		);
	}

	const words = pieces.filter((piece) => !piece.space).length;
	const step = pieceStep(timing, words, WORD_SHARE, WORD_CAP);
	let index = 0;
	return (
		<span className="fx-cascade" data-cascade={mode}>
			{pieces.map((piece) => {
				if (piece.space) {
					return piece.value;
				}
				const style = delayStyle(timing.delay + index * step);
				index += 1;
				if (mode === "mask") {
					return (
						<span className="fx-word fx-mask" key={piece.id}>
							<span className="fx-mask-inner" style={style}>
								{piece.value}
							</span>
						</span>
					);
				}
				return (
					<span className="fx-word fx-blur" key={piece.id} style={style}>
						{piece.value}
					</span>
				);
			})}
		</span>
	);
}
