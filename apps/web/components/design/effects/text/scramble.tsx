"use client";

// adapted from magic ui's hyper-text (magicui.design)
import { useEffect, useMemo, useState } from "react";
import { useReducedMotionPreference } from "../use-media-query";
import {
	pieceStep,
	splitCharacters,
	splitWords,
	type TextTiming,
} from "./split";

const GLYPHS = "abcdefghijklmnopqrstuvwxyz0123456789#%&*+=?/<>";
/** new random glyphs this often, in ms; faster just reads as noise */
const SHUFFLE_MS = 45;
const LETTER_SHARE = 0.3;
const CAP = 2.5;

/**
 * A cheap deterministic stand-in for Math.random, so the scrambled first
 * frame the server renders is the same one the client hydrates.
 */
const glyphAt = (index: number, round: number) =>
	GLYPHS[(index * 131 + round * 71 + ((index * round) % 17)) % GLYPHS.length];

/**
 * Decodes the headline from random glyphs, left to right. Each word keeps
 * its real text as an invisible ghost that holds its width, with the glyphs
 * laid over the top, so lines never re-wrap while it decodes.
 */
export function Scramble({
	text,
	timing,
}: {
	text: string;
	timing: TextTiming;
}) {
	const reduced = useReducedMotionPreference();
	const pieces = useMemo(() => splitWords(text), [text]);
	const letters = useMemo(
		() =>
			pieces.reduce(
				(total, piece) => total + (piece.space ? 0 : piece.value.length),
				0
			),
		[pieces]
	);
	const [state, setState] = useState({ revealed: 0, round: 0 });
	const { delay, duration, stagger } = timing;

	useEffect(() => {
		if (reduced) {
			setState({ revealed: letters, round: 0 });
			return;
		}
		setState({ revealed: 0, round: 0 });
		const step =
			pieceStep({ delay, duration, stagger }, letters, LETTER_SHARE, CAP) *
			1000;
		if (step <= 0) {
			setState({ revealed: letters, round: 0 });
			return;
		}
		const start = performance.now() + delay * 1000;
		let frame = 0;
		let lastShuffle = 0;
		const tick = (now: number) => {
			const revealed = Math.min(
				letters,
				Math.max(0, Math.floor((now - start) / step))
			);
			if (now - lastShuffle >= SHUFFLE_MS || revealed === letters) {
				lastShuffle = now;
				setState((current) => ({ revealed, round: current.round + 1 }));
			}
			if (revealed < letters) {
				frame = requestAnimationFrame(tick);
			}
		};
		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, [delay, duration, letters, reduced, stagger]);

	let index = 0;
	return (
		<span className="fx-scramble">
			{pieces.map((piece) => {
				if (piece.space) {
					return piece.value;
				}
				let live = "";
				for (const character of splitCharacters(piece.value)) {
					live +=
						index < state.revealed
							? character
							: (glyphAt(index, state.round) ?? character);
					index += 1;
				}
				return (
					<span className="fx-word fx-scramble-word" key={piece.id}>
						<span className="fx-scramble-ghost">{piece.value}</span>
						<span className="fx-scramble-live">{live}</span>
					</span>
				);
			})}
		</span>
	);
}
