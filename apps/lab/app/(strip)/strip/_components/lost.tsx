"use client";

import {
	type CSSProperties,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { gsap, reducedMotion, useEntrance } from "../_lib/gsap";
import { PAGES } from "../_lib/pages";
import { LiquidButton } from "./liquid-button";
import { PageLink } from "./page-link";
import { Sideways } from "./sideways";
import { StripLink } from "./strip-link";

/* a misprint: the 404 laid down in four inks that didn't land on top of
   each other. the pointer pushes the plates further out; a button lines
   them back up. offsets are in em, so they scale with the type */
const PLATES = [
	{ color: "var(--glow-1)", depth: 1, name: "lilac", x: -0.05, y: 0.03 },
	{ color: "var(--mint)", depth: 0.7, name: "mint", x: 0.04, y: -0.025 },
	{ color: "var(--sage)", depth: 0.45, name: "sage", x: 0.02, y: 0.045 },
	{ color: "var(--ink)", depth: 0, name: "ink", x: 0, y: 0 },
] as const;

const TICKER = [
	"404 · page not found",
	"misprint",
	"● lilac",
	"● mint",
	"● sage",
	"● ink",
	"ekaksh janweja · strip",
] as const;

/* how far the pointer can push a plate, in px at depth 1 */
const PUSH = 28;

const em = (value: number) => `${value > 0 ? "+" : ""}${value.toFixed(2)}em`;

const entrance = () => {
	gsap
		.timeline({ defaults: { ease: "power3.out" } })
		.from("[data-plate]", {
			autoAlpha: 0,
			duration: 0.9,
			scale: 1.08,
			stagger: 0.08,
		})
		.from(
			"[data-lost-rise]",
			{ autoAlpha: 0, duration: 0.8, stagger: 0.1, y: 24 },
			0.45
		);
};

export function Lost() {
	const rootRef = useRef<HTMLDivElement>(null);
	const stageRef = useRef<HTMLDivElement>(null);
	const [registered, setRegistered] = useState(false);
	const registeredRef = useRef(false);
	useEntrance(rootRef, entrance);

	const toggle = useCallback(() => {
		setRegistered((value) => !value);
	}, []);

	/* the pointer leans on the plates, each by its own depth */
	useEffect(() => {
		registeredRef.current = registered;
		const stage = stageRef.current;
		if (!stage) {
			return;
		}
		const plates = [...stage.querySelectorAll<HTMLElement>("[data-plate]")];
		if (registered) {
			gsap.to(plates, { duration: 0.6, ease: "power3.out", x: 0, y: 0 });
			return;
		}
		const fine = window.matchMedia("(pointer: fine)").matches;
		if (!fine || reducedMotion()) {
			return;
		}
		const movers = plates.map((plate) => ({
			depth: Number(plate.dataset.depth ?? 0),
			x: gsap.quickTo(plate, "x", { duration: 0.8, ease: "power3.out" }),
			y: gsap.quickTo(plate, "y", { duration: 0.8, ease: "power3.out" }),
		}));
		const onMove = (event: PointerEvent) => {
			const dx = event.clientX / window.innerWidth - 0.5;
			const dy = event.clientY / window.innerHeight - 0.5;
			for (const mover of movers) {
				mover.x(dx * PUSH * 2 * mover.depth);
				mover.y(dy * PUSH * 2 * mover.depth);
			}
		};
		window.addEventListener("pointermove", onMove, { passive: true });
		return () => window.removeEventListener("pointermove", onMove);
	}, [registered]);

	return (
		<div className="lost" data-registered={registered} ref={rootRef}>
			<Sideways>
				<section aria-labelledby="lost-title" className="panel lost-main">
					<div className="lost-copy">
						<p className="lost-mark" data-lost-rise="">
							<svg
								aria-hidden="true"
								className="lost-reg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle cx="12" cy="12" r="7" stroke="currentColor" />
								<path d="M12 1v22M1 12h22" stroke="currentColor" />
							</svg>
							misprint · error 404
						</p>
						<h1 className="lost-title" data-lost-rise="" id="lost-title">
							page <em>not found.</em>
						</h1>
						<p className="lost-sub" data-lost-rise="">
							this one got misprinted. the page doesn't exist; the work does.
						</p>
						<div className="lost-actions" data-lost-rise="">
							<LiquidButton href="/strip" label="home">
								back to the start
							</LiquidButton>
							<StripLink
								className="page-next-link"
								data-cursor="nav"
								href="/strip"
								label="home"
							>
								or start at the beginning →
							</StripLink>
						</div>
					</div>
					<div
						aria-hidden="true"
						className="lost-stage"
						data-cursor="label"
						data-cursor-label="misprint"
						ref={stageRef}
					>
						{PLATES.map((plate) => (
							<span
								className="lost-plate"
								data-depth={plate.depth}
								data-plate=""
								key={plate.name}
								style={
									{
										"--plate": plate.color,
										"--x": `${plate.x}em`,
										"--y": `${plate.y}em`,
									} as CSSProperties
								}
							>
								404
							</span>
						))}
					</div>
					<div aria-hidden="true" className="lost-ticker">
						<div className="lost-ticker-track">
							{TICKER.map((item) => (
								<span key={`a-${item}`}>{item}</span>
							))}
							{TICKER.map((item) => (
								<span key={`b-${item}`}>{item}</span>
							))}
						</div>
					</div>
				</section>

				<section aria-labelledby="lost-spec" className="panel lost-side">
					<div className="lost-spec" data-reveal="">
						<h2 className="page-label" id="lost-spec">
							print specification
						</h2>
						<ul className="lost-plates">
							{PLATES.map((plate) => (
								<li key={plate.name}>
									<span
										aria-hidden="true"
										className="lost-swatch"
										style={{ background: plate.color }}
									/>
									<span className="lost-plate-name">{plate.name}</span>
									<span className="lost-plate-off">
										{registered || plate.depth === 0
											? "on register"
											: `off ${em(plate.x)}, ${em(plate.y)}`}
									</span>
								</li>
							))}
						</ul>
						<button
							aria-pressed={registered}
							className="lost-register"
							data-cursor="nav"
							onClick={toggle}
							type="button"
						>
							line up the plates
						</button>
						<p className="lost-note" role="status">
							{registered
								? "in register. still nothing here, though."
								: "three plates slipped. move the pointer and they slip further."}
						</p>
					</div>
					<nav aria-label="try instead" className="lost-elsewhere">
						<p className="page-label">try instead</p>
						<ul>
							<li>
								<StripLink data-cursor="nav" href="/strip" label="home">
									home
								</StripLink>
							</li>
							{PAGES.map((page) => (
								<li key={page.href}>
									<PageLink
										data-cursor="nav"
										href={page.href}
										label={page.label}
									>
										{page.label}
									</PageLink>
								</li>
							))}
						</ul>
					</nav>
				</section>
			</Sideways>
		</div>
	);
}
