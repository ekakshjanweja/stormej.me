"use client";

import { useEffect, useRef, useState } from "react";
import { AgentView } from "./agent-view";
import { CursorLabel } from "./cursor-label";
import { RadioProvider } from "./radio";
import { SiteFooter } from "./site-footer";
import { type Mode, SiteHeader } from "./site-header";

/* everything around a page that isn't the ring: the header, agent mode,
   the footer, the cursor pill, and the reveals as you scroll */

interface ShellProps {
	children: React.ReactNode;
	/** the page as markdown, for agent mode */
	markdown: string;
}

/** a block counts as seen once this much of it is inside the screen */
const REVEAL_MARGIN = "0px 0px -10% 0px";

export function Shell({ children, markdown }: ShellProps) {
	const [mode, setMode] = useState<Mode>("human");
	const pageRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (mode !== "agent") {
			return;
		}
		const onKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setMode("human");
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [mode]);

	/* blocks marked data-reveal rise in once, the first time they're seen */
	useEffect(() => {
		const page = pageRef.current;
		if (!page) {
			return;
		}
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						entry.target.setAttribute("data-in", "");
						observer.unobserve(entry.target);
					}
				}
			},
			{ rootMargin: REVEAL_MARGIN }
		);
		for (const el of page.querySelectorAll("[data-reveal]")) {
			observer.observe(el);
		}
		return () => observer.disconnect();
	}, []);

	return (
		<RadioProvider>
			<a className="skip-link" href="#main">
				skip to content
			</a>
			<SiteHeader mode={mode} onMode={setMode} variant="page" />
			<AgentView
				markdown={markdown}
				variant="page"
				visible={mode === "agent"}
			/>
			<div
				className="page"
				data-mode={mode}
				inert={mode === "agent"}
				ref={pageRef}
			>
				<main id="main" tabIndex={-1}>
					{children}
				</main>
				<SiteFooter />
			</div>
			<CursorLabel enabled={mode === "human"} />
			<noscript>
				<style>
					{
						"[data-reveal],[data-reveal] .word-mask>span{opacity:1!important;transform:none!important}"
					}
				</style>
			</noscript>
		</RadioProvider>
	);
}
