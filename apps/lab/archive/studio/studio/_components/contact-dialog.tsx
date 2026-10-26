"use client";

import { type RefObject, useCallback, useEffect } from "react";
import { LINKS, PERSON } from "@/lib/profile";
import { gsap, reducedMotion, setPaused } from "../_lib/gsap";
import { NEW_TAB } from "./external-link";

/* a native modal dialog, so focus is trapped, the page behind is inert and
   escape works for free. the motion only decorates it: the panel opens as
   a clip from the bottom edge and drops away when it closes */

const ROWS = [
	{ href: `mailto:${PERSON.email}`, label: "email", value: PERSON.email },
	{ href: LINKS.cal, label: "call", value: "book 30 minutes" },
	{ href: LINKS.github, label: "github", value: "ekakshjanweja" },
	{ href: LINKS.linkedin, label: "linkedin", value: "ekaksh janweja" },
	{ href: LINKS.instagram, label: "instagram", value: "@stormej.studio" },
	{ href: LINKS.x, label: "x", value: "@ekaksh_janweja" },
];

const external = (href: string) => href.startsWith("http");

interface ContactDialogProps {
	dialogRef: RefObject<HTMLDialogElement | null>;
}

export const openDialog = (dialog: HTMLDialogElement | null) => {
	if (!dialog || dialog.open) {
		return;
	}
	dialog.showModal();
	setPaused("contact", true);
	if (reducedMotion()) {
		return;
	}
	const panel = dialog.querySelector(".contact-panel");
	gsap
		.timeline()
		.fromTo(
			dialog.querySelector(".contact-overlay"),
			{ opacity: 0 },
			{ duration: 1.25, ease: "power3.out", opacity: 1 }
		)
		.fromTo(
			panel,
			{
				clipPath: "inset(100% 20% 0% 20% round 24px)",
				scale: 1,
				yPercent: 0,
			},
			{
				clipPath: "inset(0% 0% 0% 0% round 24px)",
				duration: 1.5,
				ease: "expo.inOut",
			},
			0
		)
		.fromTo(
			dialog.querySelectorAll("[data-block]"),
			{ clipPath: "inset(100% 0% 0% 0%)", y: 50 },
			{
				clipPath: "inset(0% 0% 0% 0%)",
				duration: 1.2,
				ease: "expo.out",
				stagger: 0.04,
				y: 0,
			},
			0.75
		);
};

const closeDialog = (dialog: HTMLDialogElement | null) => {
	if (!dialog?.open) {
		return;
	}
	const done = () => {
		dialog.close();
		setPaused("contact", false);
	};
	if (reducedMotion()) {
		done();
		return;
	}
	gsap
		.timeline({ onComplete: done })
		.to(dialog.querySelector(".contact-panel"), {
			duration: 1,
			ease: "expo.inOut",
			scale: 0.75,
			yPercent: 100,
		})
		.to(
			dialog.querySelector(".contact-overlay"),
			{ duration: 0.8, ease: "power2.in", opacity: 0 },
			0.2
		);
};

export function ContactDialog({ dialogRef }: ContactDialogProps) {
	const close = useCallback(() => closeDialog(dialogRef.current), [dialogRef]);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) {
			return;
		}
		/* escape plays the closing motion instead of snapping shut */
		const onCancel = (event: Event) => {
			event.preventDefault();
			closeDialog(dialog);
		};
		const onClick = (event: MouseEvent) => {
			if ((event.target as Element).classList.contains("contact-overlay")) {
				closeDialog(dialog);
			}
		};
		dialog.addEventListener("cancel", onCancel);
		dialog.addEventListener("click", onClick);
		return () => {
			dialog.removeEventListener("cancel", onCancel);
			dialog.removeEventListener("click", onClick);
		};
	}, [dialogRef]);

	return (
		<dialog aria-labelledby="contact-title" className="contact" ref={dialogRef}>
			<div aria-hidden="true" className="contact-overlay" />
			<div className="contact-panel">
				<div className="contact-head" data-block="">
					<h2 className="contact-title" id="contact-title">
						say hi
					</h2>
					<button
						className="contact-close"
						data-sfx="close"
						onClick={close}
						type="button"
					>
						close
					</button>
				</div>
				<p className="contact-text" data-block="">
					tell me what you're building. i'm in {PERSON.location}, on ist.
				</p>
				<ul className="contact-rows">
					{ROWS.map((row) => (
						<li data-block="" key={row.label}>
							<a
								className="contact-row"
								href={row.href}
								rel={external(row.href) ? "noopener noreferrer" : undefined}
								target={external(row.href) ? "_blank" : undefined}
							>
								<span className="contact-label">{row.label}</span>
								<span className="contact-value">{row.value}</span>
								<span aria-hidden="true" className="contact-arrow">
									↗
								</span>
								{external(row.href) ? (
									<span className="sr-only"> ({NEW_TAB})</span>
								) : null}
							</a>
						</li>
					))}
				</ul>
			</div>
		</dialog>
	);
}
