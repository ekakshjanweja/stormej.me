"use client";

import dynamic from "next/dynamic";
import type { CSSProperties } from "react";
import { useDesign } from "@/components/design/preview-bridge";
import { type DesignConfig, motionTokens } from "@/lib/design/options";
import type { TextTiming } from "./text/split";

type TextEffect = Exclude<DesignConfig["textEffect"], "none">;

// each effect is its own chunk, fetched only by designs that use it; they
// still render on the server so the headline never pops in after hydration
const Typewriter = dynamic(() =>
	import("./text/typewriter").then((module) => module.Typewriter)
);
const Scramble = dynamic(() =>
	import("./text/scramble").then((module) => module.Scramble)
);
const Cascade = dynamic(() =>
	import("./text/cascade").then((module) => module.Cascade)
);

/** effects that are one styled span; app/design-motion.css does the rest */
const STYLED = new Set<TextEffect>([
	"aurora",
	"glitch",
	"highlight",
	"shimmer",
]);

function Effect({
	effect,
	text,
	timing,
}: {
	effect: TextEffect;
	text: string;
	timing: TextTiming;
}) {
	switch (effect) {
		case "typewriter":
			return <Typewriter text={text} timing={timing} />;
		case "scramble":
			return <Scramble text={text} timing={timing} />;
		case "blur":
		case "letters":
		case "mask":
			return <Cascade mode={effect} text={text} timing={timing} />;
		default:
			return (
				<span
					className={`fx-text fx-text-${effect}`}
					data-text={text}
					style={{ "--fx-text-delay": `${timing.delay}s` } as CSSProperties}
				>
					{text}
				</span>
			);
	}
}

/**
 * The hero's h1 text, with the design's headline effect. The real sentence
 * is always server rendered once for screen readers and search; the animated
 * copy is aria-hidden and laid over an invisible ghost of the text, so the
 * heading keeps its final size while (and before) the effect plays. It's
 * keyed on the studio's replay counter, so "replay" starts it over.
 */
export function HeroHeadline({ text }: { text: string }) {
	const { design, replay } = useDesign();
	const effect = design.textEffect;
	if (effect === "none") {
		return text;
	}

	const tokens = motionTokens(design);
	const timing: TextTiming = {
		// wait for the h1's own entrance (third in the hero's stagger) to begin
		delay: design.entrance === "none" ? 0 : tokens.stagger * 2,
		duration: tokens.duration,
		stagger: tokens.stagger,
	};

	return (
		<>
			<span className="sr-only">{text}</span>
			<span aria-hidden="true" className="hero-fx" data-effect={effect}>
				<span className="hero-fx-ghost">{text}</span>
				<span
					className="hero-fx-live"
					data-styled={STYLED.has(effect) || undefined}
					key={replay}
				>
					<Effect effect={effect} text={text} timing={timing} />
				</span>
			</span>
		</>
	);
}
