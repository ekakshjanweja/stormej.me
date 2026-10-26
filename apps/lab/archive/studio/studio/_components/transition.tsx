"use client";

import { usePathname, useRouter } from "next/navigation";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useRef,
} from "react";
import { caseFor } from "@/lib/cases";
import { DitherSweep } from "../_lib/dither";
import { gsap, reducedMotion, ScrollTrigger } from "../_lib/gsap";
import { jumpTo, scrollToTarget } from "./smooth-scroll";

/* between studio pages a sage dither rises from the floor, holds the next
   page's name for a beat, and carries on up and out once that page is in.
   the header and footer never unmount; only main changes. reduced motion
   skips the curtain and lets next navigate as usual. either way focus lands
   on the new main, so a screen reader starts at the top of the new page */

const COVER = 0.55;
const CLEAR = 0.6;
/** give up waiting on a page that never arrives */
const SAFETY = 5000;

type Navigate = (href: string) => boolean;

const NavigateContext = createContext<Navigate>(() => false);

/** takes over a studio link; returns false to let next handle it */
export const useStudioNavigate = () => useContext(NavigateContext);

const LABELS: Record<string, string> = {
	"/studio": "studio",
	"/studio/about": "about",
	"/studio/privacy": "privacy",
	"/studio/work": "work",
	"/studio/writing": "notes",
};

const CASE_PATH = /^\/studio\/work\/([^/]+)$/;

const labelFor = (pathname: string) => {
	const slug = pathname.match(CASE_PATH)?.[1];
	if (slug) {
		return caseFor(slug)?.title ?? "work";
	}
	return LABELS[pathname] ?? "studio";
};

const hashTarget = (hash: string) =>
	hash.length > 1
		? document.getElementById(decodeURIComponent(hash.slice(1)))
		: null;

const focusMain = () => {
	document.getElementById("main-content")?.focus({ preventScroll: true });
};

interface Pending {
	hash: string;
	safety: number;
}

export function PageTransition({ children }: { children: ReactNode }) {
	const router = useRouter();
	const pathname = usePathname();
	const rootRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const labelRef = useRef<HTMLParagraphElement>(null);
	const sweepRef = useRef<DitherSweep | null>(null);
	const pending = useRef<Pending | null>(null);
	const current = useRef(pathname);
	const firstPath = useRef(true);
	const progress = useRef({ clear: 0, cover: 0 });

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return;
		}
		sweepRef.current = new DitherSweep(canvas, {
			axis: "up",
			body: "#3d6a4c",
			cell: 7,
			lead: "#a6c6ae",
		});
		return () => {
			sweepRef.current = null;
		};
	}, []);

	const paint = useCallback(() => {
		sweepRef.current?.draw(progress.current.cover, progress.current.clear);
	}, []);

	const reveal = useCallback(() => {
		const root = rootRef.current;
		const job = pending.current;
		if (job) {
			window.clearTimeout(job.safety);
		}
		gsap
			.timeline({
				onComplete: () => {
					pending.current = null;
					sweepRef.current?.clear();
					if (root) {
						root.dataset.state = "idle";
					}
				},
			})
			.to(labelRef.current, {
				duration: 0.25,
				ease: "power2.in",
				opacity: 0,
				y: -24,
			})
			.to(
				progress.current,
				{
					clear: 1,
					duration: CLEAR,
					ease: "power2.inOut",
					onUpdate: paint,
				},
				0.05
			);
	}, [paint]);

	const navigate = useCallback<Navigate>(
		(href) => {
			const url = new URL(href, window.location.href);
			if (url.pathname === current.current) {
				/* same page: glide instead of reloading it */
				const target = hashTarget(url.hash);
				if (url.hash && target) {
					scrollToTarget(target);
					history.replaceState(null, "", url.hash);
				} else {
					scrollToTarget(0);
				}
				return true;
			}
			if (pending.current) {
				return true;
			}
			if (reducedMotion() || !sweepRef.current) {
				return false;
			}
			const root = rootRef.current;
			const label = labelRef.current;
			pending.current = {
				hash: url.hash,
				safety: window.setTimeout(reveal, SAFETY),
			};
			sweepRef.current.resize();
			progress.current.cover = 0;
			progress.current.clear = 0;
			if (root) {
				root.dataset.state = "active";
			}
			if (label) {
				label.textContent = labelFor(url.pathname);
			}
			gsap
				.timeline({ onComplete: () => router.push(href) })
				.to(progress.current, {
					cover: 1,
					duration: COVER,
					ease: "power2.inOut",
					onUpdate: paint,
				})
				.fromTo(
					label,
					{ opacity: 0, y: 24 },
					{ duration: 0.35, ease: "power3.out", opacity: 1, y: 0 },
					COVER * 0.55
				);
			return true;
		},
		[paint, reveal, router]
	);

	/* the new page has rendered: put the scroll where it belongs, hand focus
	   to it, then lift the curtain */
	useEffect(() => {
		current.current = pathname;
		if (firstPath.current) {
			firstPath.current = false;
			return;
		}
		const job = pending.current;
		let frame = requestAnimationFrame(() => {
			frame = requestAnimationFrame(() => {
				ScrollTrigger.refresh();
				focusMain();
				/* without a curtain next has already scrolled (or restored the
				   scroll, on back and forward), so leave it be */
				if (job) {
					jumpTo(hashTarget(job.hash) ?? 0);
					reveal();
				}
			});
		});
		return () => cancelAnimationFrame(frame);
	}, [pathname, reveal]);

	return (
		<NavigateContext.Provider value={navigate}>
			{children}
			<div
				aria-hidden="true"
				className="curtain"
				data-state="idle"
				ref={rootRef}
			>
				<canvas className="curtain-canvas" ref={canvasRef} />
				<p className="curtain-label" ref={labelRef} />
			</div>
		</NavigateContext.Provider>
	);
}
