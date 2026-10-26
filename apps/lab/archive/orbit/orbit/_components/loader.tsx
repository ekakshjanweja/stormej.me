"use client";

import { useEffect, useRef, useState } from "react";
import { clamp, damp } from "@/lib/motion";
import { PRELOAD } from "../_lib/content";

/* a paper screen while the card images come in. the name rises letter by
   letter, an odometer counts what has actually loaded, and on the way out
   the name flies up into the header wordmark */

const NAME = "ekaksh";
/** never shorter than this, so the name has time to land */
const MIN_MS = 1600;
/** a dead network should not hold the page hostage */
const MAX_MS = 6000;
const HOLD_AT_FULL_MS = 280;
const FLIGHT_MS = 1100;
/** the odometer's wheels, left to right */
const PLACES = ["hundreds", "tens", "ones"] as const;
const DIGIT_FACES = Array.from({ length: 10 }, (_, digit) => digit);
/* "ekaksh" has two k's, so each letter is keyed by its place */
const LETTERS = Array.from(NAME, (letter, place) => ({
	id: `${place}-${letter}`,
	letter,
	place,
}));

interface LoaderBrandProps {
	/** the name has landed and the real wordmark has taken over */
	handedOff: boolean;
	leaving: boolean;
}

/* the name lives outside the frame: the frame's clip-path shrinks while
   the name is still flying, and would cut it off */
export function LoaderBrand({ handedOff, leaving }: LoaderBrandProps) {
	const brandRef = useRef<HTMLParagraphElement>(null);
	const wordRef = useRef<HTMLSpanElement>(null);

	/* fly the name onto the header wordmark */
	useEffect(() => {
		if (!leaving) {
			return;
		}
		const brand = brandRef.current;
		const word = wordRef.current;
		const target = document.querySelector<HTMLElement>("[data-wordmark]");
		if (!(brand && word && target)) {
			return;
		}
		const origin = brand.getBoundingClientRect();
		const from = word.getBoundingClientRect();
		const to = target.getBoundingClientRect();
		const scale = to.height / from.height;
		/* scale about the brand's corner, then move the word onto the target */
		const dx = to.left - origin.left - scale * (from.left - origin.left);
		const dy = to.top - origin.top - scale * (from.top - origin.top);
		brand.animate(
			[
				{ transform: "none" },
				{ transform: `translate(${dx}px, ${dy}px) scale(${scale})` },
			],
			{
				duration: FLIGHT_MS,
				easing: "cubic-bezier(.65,0,.15,1)",
				fill: "forwards",
			}
		);
	}, [leaving]);

	return (
		<p
			aria-hidden
			className="loader-brand"
			data-handed-off={handedOff || undefined}
			data-leaving={leaving || undefined}
			ref={brandRef}
		>
			<span className="loader-word" ref={wordRef}>
				{LETTERS.map(({ id, letter, place }) => (
					<span className="loader-mask" key={id}>
						<span style={{ "--i": place } as React.CSSProperties}>
							{letter}
						</span>
					</span>
				))}
			</span>
			<span className="loader-mask loader-dot">
				<span style={{ "--i": NAME.length } as React.CSSProperties}>.</span>
			</span>
		</p>
	);
}

interface LoaderProps {
	leaving: boolean;
	onReady: () => void;
	onSkip: () => void;
}

export function Loader({ leaving, onReady, onSkip }: LoaderProps) {
	const [shown, setShown] = useState(0);
	const readyRef = useRef(onReady);
	readyRef.current = onReady;

	/* preload and count */
	useEffect(() => {
		let loaded = 0;
		const total = PRELOAD.length;
		for (const src of PRELOAD) {
			const img = new window.Image();
			const done = () => {
				loaded += 1;
			};
			img.onload = done;
			img.onerror = done;
			img.src = src;
		}

		const start = performance.now();
		let value = 0;
		let last = start;
		let frame = 0;
		let finishedAt = -1;

		const tick = (now: number) => {
			const dt = Math.min(now - last, 64) / 1000;
			last = now;
			const elapsed = now - start;
			const real = elapsed > MAX_MS ? 100 : (loaded / total) * 100;
			/* the count can't outrun the clock, so it always reads as a count */
			const allowed = Math.min(real, (elapsed / MIN_MS) * 100);
			value = damp(value, allowed, 5, dt);
			if (allowed >= 100 && value > 99.4) {
				value = 100;
			}
			setShown(Math.round(value));
			if (value >= 100) {
				if (finishedAt < 0) {
					finishedAt = now;
				}
				if (now - finishedAt > HOLD_AT_FULL_MS) {
					readyRef.current();
					return;
				}
			}
			frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, []);

	const digits = String(clamp(shown, 0, 100)).padStart(PLACES.length, "0");

	return (
		<div className="loader" data-leaving={leaving || undefined}>
			<div className="loader-status">
				<p aria-hidden className="loader-caption">
					hanging the work
				</p>
				<div
					aria-label="loading the work"
					aria-valuemax={100}
					aria-valuemin={0}
					aria-valuenow={shown}
					className="loader-count"
					role="progressbar"
				>
					<span className="loader-mask">
						<span className="odometer">
							{PLACES.map((place, position) => (
								<span className="odometer-digit" key={place}>
									<span
										style={{
											transform: `translateY(${-Number(digits[position]) * 10}%)`,
										}}
									>
										{DIGIT_FACES.map((face) => (
											<span key={face}>{face}</span>
										))}
									</span>
								</span>
							))}
						</span>
					</span>
					<span className="loader-percent">%</span>
				</div>
			</div>
			<button
				aria-label="skip the entrance"
				className="loader-skip"
				onClick={onSkip}
				type="button"
			>
				skip <kbd>esc</kbd>
			</button>
		</div>
	);
}
