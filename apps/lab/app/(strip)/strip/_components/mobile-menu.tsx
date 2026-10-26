"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LINKS } from "@/lib/profile";
import { gsap, reducedMotion } from "../_lib/gsap";
import { currentFor, PAGES } from "../_lib/pages";
import { ExternalLink } from "./external-link";
import { PageLink } from "./page-link";
import { SpotifyMini } from "./spotify";

const ITEMS = [{ href: "/strip", label: "home" }, ...PAGES] as const;

/* under 1200px the nav folds into "menu": a dark layer wipes down and the
   links rise in, big */
export function MobileMenu({ pathname }: { pathname: string }) {
	const [open, setOpen] = useState(false);
	const [mounted, setMounted] = useState(false);
	const id = useId();
	const layerRef = useRef<HTMLDivElement>(null);
	const toggleRef = useRef<HTMLButtonElement>(null);

	const toggle = useCallback(() => setOpen((value) => !value), []);
	const close = useCallback(() => setOpen(false), []);

	useEffect(() => {
		const layer = layerRef.current;
		if (!(mounted && layer)) {
			return;
		}
		const main = document.getElementById("strip-main");
		if (main) {
			main.inert = open;
		}
		if (!open) {
			return;
		}
		layer.querySelector<HTMLElement>("a")?.focus();
		if (!reducedMotion()) {
			gsap
				.timeline()
				.fromTo(
					layer,
					{ clipPath: "inset(0% 0% 100% 0%)" },
					{
						clipPath: "inset(0% 0% 0% 0%)",
						duration: 0.85,
						ease: "power4.inOut",
					}
				)
				.fromTo(
					layer.querySelectorAll("[data-item]"),
					{ yPercent: 110 },
					{ duration: 0.8, ease: "power4.out", stagger: 0.05, yPercent: 0 },
					0.35
				);
		}
		const onKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setOpen(false);
				toggleRef.current?.focus();
			}
		};
		window.addEventListener("keydown", onKey);
		return () => {
			window.removeEventListener("keydown", onKey);
			if (main) {
				main.inert = false;
			}
		};
	}, [open, mounted]);

	useEffect(() => setMounted(true), []);

	/* a navigation closes it */
	useEffect(() => {
		if (pathname) {
			setOpen(false);
		}
	}, [pathname]);

	return (
		<>
			<button
				aria-controls={id}
				aria-expanded={open}
				className="menu-toggle"
				onClick={toggle}
				ref={toggleRef}
				type="button"
			>
				{open ? "close" : "menu"}
			</button>
			{/* portalled out of the blended header */}
			{mounted
				? createPortal(
						<div
							aria-label="menu"
							aria-modal="true"
							className="menu-layer"
							data-open={open}
							hidden={!open}
							id={id}
							ref={layerRef}
							role="dialog"
						>
							<nav aria-label="pages">
								<ul>
									{ITEMS.map((item) => (
										<li className="menu-mask" key={item.href}>
											<PageLink
												aria-current={currentFor(pathname, item.href)}
												data-item=""
												href={item.href}
												label={item.label}
												onClick={close}
											>
												{item.label}
											</PageLink>
										</li>
									))}
								</ul>
							</nav>
							<p className="menu-foot">
								<ExternalLink href={LINKS.github}>github</ExternalLink>
								<ExternalLink href={LINKS.linkedin}>linkedin</ExternalLink>
								<ExternalLink href={LINKS.instagram}>instagram</ExternalLink>
							</p>
							<SpotifyMini className="spin-menu" />
						</div>,
						document.body
					)
				: null}
		</>
	);
}
