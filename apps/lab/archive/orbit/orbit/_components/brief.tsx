"use client";

import { type ChangeEvent, type FormEvent, useCallback, useState } from "react";
import { PERSON } from "@/lib/profile";
import { playSfx } from "@/lib/sfx";

/* the contact sentence: fill in the blanks and it becomes an email. nothing
   is sent from here; it only opens your mail app with the words in it */

const WHENS = ["in 8 weeks", "in 3 months", "when it's right"] as const;
const COPIED_MS = 1600;

export function Brief() {
	const [what, setWhat] = useState("");
	const [who, setWho] = useState("");
	const [when, setWhen] = useState<string>(WHENS[0]);
	const [copied, setCopied] = useState(false);

	const onWhat = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => setWhat(event.target.value),
		[]
	);
	const onWho = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => setWho(event.target.value),
		[]
	);
	const onWhen = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => setWhen(event.target.value),
		[]
	);
	const copy = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(PERSON.email);
			setCopied(true);
			await playSfx("success");
			setTimeout(() => setCopied(false), COPIED_MS);
		} catch {
			/* no clipboard; the address is written right there */
		}
	}, []);

	const thing = what.trim() || "something new";
	const people = who.trim() || "the people it's for";
	const subject = `a project: ${thing}`;
	const body = `hi ekaksh,\n\ni'm building ${thing} for ${people}, and i need it ${when}.\n\n`;
	const mailto = `mailto:${PERSON.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

	/* enter in a blank does the same as the button */
	const send = useCallback(
		(event: FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			window.location.assign(mailto);
		},
		[mailto]
	);

	return (
		<form aria-label="a note to ekaksh" className="brief" onSubmit={send}>
			<p className="kicker">tell me what you're making</p>
			<p className="brief-line">
				i'm building{" "}
				<input
					aria-label="what you're building"
					className="brief-blank"
					onChange={onWhat}
					placeholder="a voice app"
					size={Math.max(what.length, 11)}
					type="text"
					value={what}
				/>{" "}
				for{" "}
				<input
					aria-label="who it's for"
					className="brief-blank"
					onChange={onWho}
					placeholder="people who hate typing"
					size={Math.max(who.length, 21)}
					type="text"
					value={who}
				/>
				, and i need it{" "}
				<span className="brief-when">
					{WHENS.map((option, index) => (
						<span key={option}>
							{index > 0 ? (
								<span aria-hidden="true" className="slash">
									{" "}
									/{" "}
								</span>
							) : null}
							<label className="brief-option">
								<input
									checked={when === option}
									className="sr-only"
									name="when"
									onChange={onWhen}
									type="radio"
									value={option}
								/>
								<span>{option}</span>
							</label>
						</span>
					))}
				</span>
				.
			</p>
			<div className="brief-foot">
				<p className="brief-note">
					goes to {PERSON.email}, from your own mail app.
				</p>
				<div className="brief-actions">
					<button
						className="pill"
						data-sfx="silent"
						onClick={copy}
						type="button"
					>
						{copied ? "copied" : "copy email"}
					</button>
					<a className="pill pill-solid" href={mailto}>
						write the email
					</a>
				</div>
			</div>
		</form>
	);
}
