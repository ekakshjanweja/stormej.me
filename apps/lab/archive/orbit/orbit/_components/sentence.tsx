"use client";

import Link from "next/link";
import {
	type FocusEvent,
	type PointerEvent,
	useCallback,
	useState,
} from "react";
import { ROUTES, WORLDS, type WorldId } from "../_lib/content";

/* the headline is the menu: three words open the three worlds, and
   hovering one dims every card that isn't part of it. "say hi" opens
   contact */

type ChoiceId = WorldId | "hi";

interface Choice {
	href: string;
	id: ChoiceId;
	on: string;
	trail?: string;
	words: string[];
	world: string;
}

type Token = string | Choice;

const choiceFor = (id: WorldId, words: string[], trail?: string): Choice => ({
	href: WORLDS[id].href,
	id,
	on: WORLDS[id].on,
	trail,
	words,
	world: WORLDS[id].color,
});

const TOKENS: Token[] = [
	"i",
	"build",
	"products",
	"for",
	choiceFor("work", ["startups"], ","),
	"side",
	"projects",
	"for",
	choiceFor("build", ["fun"], ","),
	"and",
	"write-ups",
	"for",
	choiceFor("write", ["developers"], "."),
	"or",
	"just",
	{
		href: ROUTES.contact,
		id: "hi",
		on: "var(--paper)",
		trail: ".",
		words: ["say", "hi"],
		world: "var(--ink)",
	},
];

/** every word gets an index so the reveal can stagger across the line */
const INDEXED = (() => {
	let index = 0;
	return TOKENS.map((token) => {
		if (typeof token === "string") {
			index += 1;
			return { index: index - 1, token };
		}
		const start = index;
		index += token.words.length + (token.trail ? 1 : 0);
		return { index: start, token };
	});
})();

function Word({ index, text }: { index: number; text: string }) {
	return (
		<span className="word-mask">
			<span style={{ "--i": index } as React.CSSProperties}>{text}</span>
		</span>
	);
}

interface SentenceProps {
	onFocusWorld: (world: WorldId | null) => void;
}

export function Sentence({ onFocusWorld }: SentenceProps) {
	const [active, setActive] = useState<ChoiceId | null>(null);

	const enter = useCallback(
		(event: FocusEvent<HTMLElement> | PointerEvent<HTMLElement>) => {
			const id = event.currentTarget.dataset.choice as ChoiceId;
			setActive(id);
			onFocusWorld(id === "hi" ? null : id);
		},
		[onFocusWorld]
	);
	const leave = useCallback(() => {
		setActive(null);
		onFocusWorld(null);
	}, [onFocusWorld]);

	let number = 0;

	return (
		<h1 className="sentence" data-hovering={active !== null || undefined}>
			{INDEXED.map(({ index, token }) => {
				if (typeof token === "string") {
					return (
						<span key={index}>
							<Word index={index} text={token} />{" "}
						</span>
					);
				}
				number += 1;
				return (
					<span className="nowrap" key={index}>
						<Link
							className="choice"
							data-active={active === token.id || undefined}
							data-choice={token.id}
							href={token.href}
							onBlur={leave}
							onFocus={enter}
							onPointerEnter={enter}
							onPointerLeave={leave}
							style={
								{
									"--i": index,
									"--on": token.on,
									"--world": token.world,
								} as React.CSSProperties
							}
						>
							<span className="choice-label">
								<span aria-hidden className="marker" />
								{token.words.map((word, offset) => (
									<span key={word}>
										{offset > 0 ? " " : null}
										<Word index={index + offset} text={word} />
									</span>
								))}
								<span aria-hidden className="underline" />
							</span>
							<sup aria-hidden>{String(number).padStart(2, "0")}</sup>
						</Link>
						{token.trail ? (
							<Word index={index + token.words.length} text={token.trail} />
						) : null}{" "}
					</span>
				);
			})}
		</h1>
	);
}
