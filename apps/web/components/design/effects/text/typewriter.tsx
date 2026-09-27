"use client";

// adapted from magic ui's typing-animation (magicui.design)
import { useEffect, useMemo, useState } from "react";
import { useReducedMotionPreference } from "../use-media-query";
import { splitCharacters, type TextTiming } from "./split";

/** a key press is a fraction of the feel's stagger... */
const KEY_SHARE = 0.4;
/** ...but a whole headline never takes longer than this to type */
const MAX_TYPING_SECONDS = 5;

/**
 * Types the headline out with a caret. The untyped rest is still rendered,
 * just transparent, so every line is where it will end up and nothing below
 * the headline moves while it types.
 */
export function Typewriter({
	text,
	timing,
}: {
	text: string;
	timing: TextTiming;
}) {
	const reduced = useReducedMotionPreference();
	const characters = useMemo(() => splitCharacters(text), [text]);
	const [typed, setTyped] = useState(0);
	const { delay, stagger } = timing;

	useEffect(() => {
		const total = characters.length;
		if (reduced) {
			setTyped(total);
			return;
		}
		setTyped(0);
		const perKey =
			Math.min(stagger * KEY_SHARE, MAX_TYPING_SECONDS / Math.max(total, 1)) *
			1000;
		if (perKey <= 0) {
			setTyped(total);
			return;
		}
		const start = performance.now() + delay * 1000;
		let frame = 0;
		const tick = (now: number) => {
			const next = Math.min(
				total,
				Math.max(0, Math.floor((now - start) / perKey))
			);
			setTyped(next);
			if (next < total) {
				frame = requestAnimationFrame(tick);
			}
		};
		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, [characters, delay, reduced, stagger]);

	const done = typed >= characters.length;

	return (
		<span className="fx-type" data-done={done || undefined}>
			{characters.slice(0, typed).join("")}
			<span className="fx-type-caret" />
			<span className="fx-type-rest">{characters.slice(typed).join("")}</span>
		</span>
	);
}
