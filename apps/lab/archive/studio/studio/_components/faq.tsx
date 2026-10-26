"use client";

import { useCallback, useId, useLayoutEffect, useRef, useState } from "react";
import { LINKS, PERSON } from "@/lib/profile";
import { FAQS } from "../_lib/content";
import { gsap, reducedMotion } from "../_lib/gsap";
import { ExternalLink } from "./external-link";
import { StudioLink } from "./studio-link";

/* accordion rows: a button that owns its panel. opening drops the panel
   open and lifts the answer in; closing folds it on the back-expo curve
   and only then hides it from assistive tech */

function FaqItem({
	answer,
	question,
	extra,
}: {
	answer: string;
	extra?: React.ReactNode;
	question: string;
}) {
	const id = useId();
	const [expanded, setExpanded] = useState(false);
	const [shown, setShown] = useState(false);
	const panelRef = useRef<HTMLElement>(null);
	const first = useRef(true);

	const toggle = useCallback(() => {
		setExpanded((value) => !value);
		setShown(true);
	}, []);

	useLayoutEffect(() => {
		if (first.current) {
			first.current = false;
			return;
		}
		const panel = panelRef.current;
		if (!panel) {
			return;
		}
		const body = panel.querySelector(".faq-answer");
		if (reducedMotion()) {
			if (!expanded) {
				setShown(false);
			}
			return;
		}
		const timeline = gsap.timeline();
		if (expanded) {
			timeline
				.fromTo(
					panel,
					{ height: 0 },
					{ duration: 0.5, ease: "power3.out", height: "auto" }
				)
				.fromTo(
					body,
					{ opacity: 0, y: 20 },
					{ duration: 0.6, ease: "power3.out", opacity: 1, y: 0 },
					0
				);
		} else {
			timeline
				.to(panel, {
					duration: 0.8,
					ease: "backExpoInOut",
					height: 0,
					onComplete: () => setShown(false),
				})
				.to(body, { delay: 0.2, duration: 0.6, opacity: 0 }, 0);
		}
		return () => {
			timeline.kill();
		};
	}, [expanded]);

	return (
		<li className="faq-item">
			<h3 className="faq-question">
				<button
					aria-controls={`${id}-panel`}
					aria-expanded={expanded}
					className="faq-button"
					id={`${id}-button`}
					onClick={toggle}
					type="button"
				>
					<span>{question}</span>
					<span aria-hidden="true" className="faq-icon" />
				</button>
			</h3>
			<section
				aria-labelledby={`${id}-button`}
				className="faq-panel"
				hidden={!shown}
				id={`${id}-panel`}
				ref={panelRef}
			>
				<div className="faq-answer">
					<p>{answer}</p>
					{extra}
				</div>
			</section>
		</li>
	);
}

function FaqExtra({
	link,
	question,
}: {
	link?: { href: string; label: string };
	question: string;
}) {
	if (link) {
		return (
			<p className="faq-links">
				<StudioLink href={link.href}>{link.label}</StudioLink>
			</p>
		);
	}
	if (question !== "how do i reach you?") {
		return null;
	}
	return (
		<p className="faq-links">
			<a href={`mailto:${PERSON.email}`}>email</a>
			<ExternalLink href={LINKS.cal}>book a call</ExternalLink>
			<ExternalLink href={LINKS.site}>stormej.me</ExternalLink>
		</p>
	);
}

export function Faq() {
	return (
		<section aria-labelledby="faq-title" className="faq">
			<h2 className="faq-title" id="faq-title">
				questions, answered
			</h2>
			<ul className="faq-list">
				{FAQS.map((faq) => (
					<FaqItem
						answer={faq.answer}
						extra={<FaqExtra link={faq.link} question={faq.question} />}
						key={faq.question}
						question={faq.question}
					/>
				))}
			</ul>
		</section>
	);
}
