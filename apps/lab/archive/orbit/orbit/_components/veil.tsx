"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { BASE_PATH } from "@/lib/base";
import { prefersReducedMotion } from "@/lib/motion";
import { ROUTES, WORLDS, worldOfPath } from "../_lib/content";

/* the walk between orbit pages: a panel in the destination's colour rises
   over the page with its name on it, the page changes underneath, and the
   panel lifts away. links stay plain links. this only steps in for a plain
   left click on a link to another orbit page, and never under reduced
   motion, where pages just change */

const IN_MS = 380;
const OUT_MS = 560;
/** a slow page shouldn't hold the screen hostage */
const MAX_HOLD_MS = 5000;
const EASE_IN = "cubic-bezier(0.65, 0, 0.35, 1)";
const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";
/** the rising edge is rounded like the sky's frame */
const EDGE = "32px";

const SKY =
	"linear-gradient(180deg, #adc4b5 0%, #c9d8c8 22%, #e4e6d0 48%, #f4dfb8 74%, #f0cb9c 100%)";

const TRAILING_SLASH = /\/$/;

/** the router's path for a link, without the base path */
const routeOf = (url: URL) => {
	const path = url.pathname.replace(TRAILING_SLASH, "") || "/";
	return BASE_PATH && path.startsWith(BASE_PATH)
		? path.slice(BASE_PATH.length) || "/"
		: path;
};

const toneOf = (route: string) => {
	const world = worldOfPath(route);
	if (world) {
		return { background: WORLDS[world].color, color: WORLDS[world].on };
	}
	if (route === ROUTES.home) {
		return { background: SKY, color: "#1a1d1a" };
	}
	return { background: "#1a1d1a", color: "#f5f6f2" };
};

const isOrbit = (route: string) =>
	route === ROUTES.home || route.startsWith(`${ROUTES.home}/`);

interface VeilProps {
	/** what to call each page while the veil is up, keyed by route */
	labels: Record<string, string>;
}

export function Veil({ labels }: VeilProps) {
	const router = useRouter();
	const pathname = usePathname();
	const veilRef = useRef<HTMLDivElement>(null);
	const riseRef = useRef<HTMLSpanElement>(null);
	const textRef = useRef<HTMLSpanElement>(null);
	/** the page we left, while the veil is up */
	const leaving = useRef<string | null>(null);
	const holdTimer = useRef(0);
	const animations = useRef<Animation[]>([]);

	const play = useCallback(
		(
			target: HTMLElement,
			keyframes: Keyframe[],
			options: KeyframeAnimationOptions
		) => {
			const animation = target.animate(keyframes, { fill: "both", ...options });
			animations.current.push(animation);
			return animation;
		},
		[]
	);

	/** drop finished animations, keeping the ones just started */
	const settle = useCallback((keep: Animation[]) => {
		for (const animation of animations.current) {
			if (!keep.includes(animation)) {
				animation.cancel();
			}
		}
		animations.current = keep;
	}, []);

	const lift = useCallback(() => {
		const veil = veilRef.current;
		const rise = riseRef.current;
		if (!(veil && rise) || leaving.current === null) {
			return;
		}
		window.clearTimeout(holdTimer.current);
		leaving.current = null;
		/* let the new page's words rise as the panel clears them */
		delete document.documentElement.dataset.veil;
		const panel = play(
			veil,
			[
				{ clipPath: "inset(0% 0 0 0 round 0px 0px 0px 0px)" },
				{ clipPath: `inset(0 0 100% 0 round 0px 0px ${EDGE} ${EDGE})` },
			],
			{ duration: OUT_MS, easing: EASE_OUT }
		);
		const word = play(
			rise,
			[
				{ opacity: 1, transform: "none" },
				{ opacity: 0, transform: "translateY(-45%)" },
			],
			{ duration: OUT_MS * 0.6, easing: EASE_OUT }
		);
		settle([panel, word]);
		panel.finished
			.then(() => {
				if (leaving.current === null) {
					veil.removeAttribute("data-active");
					settle([]);
				}
			})
			.catch(() => {
				/* cancelled by the next walk */
			});
	}, [play, settle]);

	const cover = useCallback(
		(route: string, href: string) => {
			const veil = veilRef.current;
			const rise = riseRef.current;
			const text = textRef.current;
			if (!(veil && rise && text)) {
				return;
			}
			leaving.current = routeOf(new URL(window.location.href));
			const tone = toneOf(route);
			veil.style.setProperty("--veil-bg", tone.background);
			veil.style.setProperty("--veil-on", tone.color);
			text.textContent = labels[route] ?? "";
			veil.setAttribute("data-active", "");
			router.prefetch(route);
			const panel = play(
				veil,
				[
					{ clipPath: `inset(100% 0 0 0 round ${EDGE} ${EDGE} 0px 0px)` },
					{ clipPath: "inset(0% 0 0 0 round 0px 0px 0px 0px)" },
				],
				{ duration: IN_MS, easing: EASE_IN }
			);
			const word = play(
				rise,
				[
					{ opacity: 1, transform: "translateY(110%)" },
					{ opacity: 1, transform: "none" },
				],
				{ delay: IN_MS * 0.35, duration: IN_MS + 220, easing: EASE_OUT }
			);
			settle([panel, word]);
			panel.finished
				.then(() => {
					document.documentElement.dataset.veil = "";
					router.push(href);
					holdTimer.current = window.setTimeout(lift, MAX_HOLD_MS);
				})
				.catch(() => {
					/* cancelled */
				});
		},
		[labels, lift, play, router, settle]
	);

	/* listen after react has had its say: a drag on the ring cancels its
	   click in the capture phase, and that must win */
	useEffect(() => {
		const onClick = (event: MouseEvent) => {
			if (
				event.defaultPrevented ||
				event.button !== 0 ||
				event.metaKey ||
				event.ctrlKey ||
				event.shiftKey ||
				event.altKey ||
				leaving.current !== null ||
				prefersReducedMotion()
			) {
				return;
			}
			const anchor =
				event.target instanceof Element ? event.target.closest("a") : null;
			if (
				!anchor ||
				(anchor.target && anchor.target !== "_self") ||
				anchor.hasAttribute("download")
			) {
				return;
			}
			const url = new URL(anchor.href, window.location.href);
			const route = routeOf(url);
			const here = routeOf(new URL(window.location.href));
			if (
				url.origin !== window.location.origin ||
				!isOrbit(route) ||
				route === here
			) {
				return;
			}
			event.preventDefault();
			cover(route, `${route}${url.search}${url.hash}`);
		};
		document.addEventListener("click", onClick, true);
		return () => document.removeEventListener("click", onClick, true);
	}, [cover]);

	/* the new page is in: start from its top and lift */
	useEffect(() => {
		if (leaving.current === null || pathname === leaving.current) {
			return;
		}
		if (!window.location.hash) {
			window.scrollTo(0, 0);
		}
		let inner = 0;
		const outer = requestAnimationFrame(() => {
			inner = requestAnimationFrame(lift);
		});
		return () => {
			cancelAnimationFrame(outer);
			cancelAnimationFrame(inner);
		};
	}, [pathname, lift]);

	useEffect(
		() => () => {
			window.clearTimeout(holdTimer.current);
			delete document.documentElement.dataset.veil;
		},
		[]
	);

	return (
		<div aria-hidden="true" className="veil" ref={veilRef}>
			<p className="veil-label">
				<span className="veil-mask">
					<span ref={riseRef}>
						<span ref={textRef} />.
					</span>
				</span>
			</p>
		</div>
	);
}
