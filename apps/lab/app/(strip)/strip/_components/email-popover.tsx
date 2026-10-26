"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { PERSON } from "@/lib/profile";
import { playSfx } from "@/lib/sfx";
import { gsap, reducedMotion } from "../_lib/gsap";

/* "email" opens a little card that grows out of a grid of sage cells,
   fused by a goo filter. esc or a click outside closes it */

/* 3 × 5 */
const CELLS = Array.from({ length: 15 }, (_, position) => `cell-${position}`);
const COPIED_FOR_MS = 1600;

export function EmailPopover() {
	const [open, setOpen] = useState(false);
	const [copied, setCopied] = useState(false);
	const id = useId();
	const triggerRef = useRef<HTMLButtonElement>(null);
	const panelRef = useRef<HTMLDivElement>(null);

	const close = useCallback(() => {
		setOpen(false);
		triggerRef.current?.focus();
	}, []);

	const toggle = useCallback(() => setOpen((value) => !value), []);

	const copy = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(PERSON.email);
			setCopied(true);
			await playSfx("success");
			setTimeout(() => setCopied(false), COPIED_FOR_MS);
		} catch {
			/* no clipboard (insecure context): the address is right there to select */
		}
	}, []);

	useEffect(() => {
		const panel = panelRef.current;
		if (!(open && panel)) {
			return;
		}
		panel.querySelector<HTMLElement>("[data-first]")?.focus();
		if (!reducedMotion()) {
			gsap
				.timeline()
				.fromTo(
					panel.querySelectorAll("[data-cell]"),
					{ scale: 0.3 },
					{
						duration: 0.9,
						ease: "expo.out",
						scale: 1,
						stagger: { amount: 0.08 * 3, from: "random" },
					}
				)
				.fromTo(
					panel.querySelector("[data-body]"),
					{ autoAlpha: 0, y: 6 },
					{ autoAlpha: 1, duration: 0.4, ease: "power2.out", y: 0 },
					0.25
				);
		}
		const onKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				close();
			}
		};
		const onPointer = (event: PointerEvent) => {
			const target = event.target as Node;
			if (!(panel.contains(target) || triggerRef.current?.contains(target))) {
				setOpen(false);
			}
		};
		window.addEventListener("keydown", onKey);
		window.addEventListener("pointerdown", onPointer);
		return () => {
			window.removeEventListener("keydown", onKey);
			window.removeEventListener("pointerdown", onPointer);
		};
	}, [open, close]);

	return (
		<span className="email">
			<button
				aria-controls={id}
				aria-expanded={open}
				className="email-trigger"
				data-cursor="nav"
				onClick={toggle}
				ref={triggerRef}
				type="button"
			>
				email
			</button>
			{/* portalled: the header blends with "difference", which would
			    invert the card */}
			{open
				? createPortal(
						<div
							aria-label="email ekaksh"
							className="email-panel"
							id={id}
							ref={panelRef}
							role="dialog"
						>
							<svg aria-hidden="true" className="sr-only" focusable="false">
								<filter id={`${id}-goo`}>
									<feGaussianBlur
										in="SourceGraphic"
										result="blur"
										stdDeviation="8"
									/>
									<feColorMatrix
										in="blur"
										values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
									/>
								</filter>
							</svg>
							<div
								aria-hidden="true"
								className="email-cells"
								style={{ filter: `url(#${id}-goo)` }}
							>
								{CELLS.map((cell) => (
									<span data-cell="" key={cell} />
								))}
							</div>
							<div className="email-body" data-body="">
								<span className="email-address">{PERSON.email}</span>
								<span className="email-actions">
									<button
										data-first=""
										data-sfx="silent"
										onClick={copy}
										type="button"
									>
										{copied ? "copied" : "copy"}
									</button>
									<a href={`mailto:${PERSON.email}`}>write →</a>
								</span>
								<span aria-live="polite" className="sr-only">
									{copied ? "email address copied" : ""}
								</span>
							</div>
						</div>,
						document.body
					)
				: null}
		</span>
	);
}
