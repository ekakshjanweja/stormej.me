"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { CARDS, type WorldId } from "../_lib/content";
import { useDrift } from "../_lib/drift";
import { AgentView } from "./agent-view";
import { CursorLabel } from "./cursor-label";
import { Loader, LoaderBrand } from "./loader";
import { RadioProvider } from "./radio";
import { Ring } from "./ring";
import { Sentence } from "./sentence";
import { type Mode, SiteHeader } from "./site-header";
import { SkyBack, SkyFront } from "./sky";

/* the whole entrance, in four beats:
   loading  paper screen, the name rises, the count runs
   intro    the paper lifts off a full-bleed sky; the ring flies in, clouds rise
   settle   the sky pulls back into a rounded window; header and line come in
   ready    hand the page over */

type Phase = "loading" | "intro" | "settle" | "ready";

const INTRO_MS = 1300;
/** matches the frame's clip-path transition in globals.css */
const SETTLE_MS = 1150;

/* the entrance plays once per visit. coming back to the ring from another
   orbit page (under the veil, or after the ring has been seen) skips it */
let entered = false;
const startSettled = () =>
	entered ||
	(typeof document !== "undefined" &&
		document.documentElement.dataset.veil !== undefined);

interface OrbitProps {
	/** the same page as plain content, for screen readers and crawlers */
	children?: React.ReactNode;
	markdown: string;
	stats: readonly { label: string; value: string }[];
}

export function Orbit({ children, markdown, stats }: OrbitProps) {
	const [phase, setPhase] = useState<Phase>(() =>
		startSettled() ? "ready" : "loading"
	);
	const [immediate, setImmediate] = useState(startSettled);
	const [reducedMotion, setReducedMotion] = useState(false);
	const [focus, setFocus] = useState<WorldId | null>(null);
	const [mode, setMode] = useState<Mode>("human");
	const frameRef = useRef<HTMLDivElement>(null);
	const stageRef = useRef<HTMLElement>(null);

	/* true for two frames after a skip: long enough to land every layer
	   without a transition, short enough to give hover effects back */
	const [jumping, setJumping] = useState(startSettled);

	const skip = useCallback(() => {
		setImmediate(true);
		setJumping(true);
		setPhase("ready");
	}, []);

	useEffect(() => {
		if (!jumping) {
			return;
		}
		let inner = 0;
		const outer = requestAnimationFrame(() => {
			inner = requestAnimationFrame(() => setJumping(false));
		});
		return () => {
			cancelAnimationFrame(outer);
			cancelAnimationFrame(inner);
		};
	}, [jumping]);
	const startIntro = useCallback(() => setPhase("intro"), []);

	useEffect(() => {
		if (prefersReducedMotion()) {
			setReducedMotion(true);
			skip();
		}
	}, [skip]);

	useEffect(() => {
		if (phase === "ready") {
			entered = true;
		}
	}, [phase]);

	/* the beats after the loader run on the clock */
	useEffect(() => {
		if (phase === "intro") {
			const timer = setTimeout(() => setPhase("settle"), INTRO_MS);
			return () => clearTimeout(timer);
		}
		if (phase === "settle") {
			const timer = setTimeout(() => setPhase("ready"), SETTLE_MS);
			return () => clearTimeout(timer);
		}
	}, [phase]);

	useEffect(() => {
		const onKey = (event: KeyboardEvent) => {
			if (event.key !== "Escape") {
				return;
			}
			if (phase !== "ready") {
				skip();
			} else if (mode === "agent") {
				setMode("human");
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [mode, phase, skip]);

	/* the sky is pinned to the viewport while the frame is a window onto
	   it, so the frame needs to know how far it sits from each edge */
	useEffect(() => {
		const frame = frameRef.current;
		if (!frame) {
			return;
		}
		const measure = () => {
			const rect = frame.getBoundingClientRect();
			frame.style.setProperty("--ft", `${rect.top}px`);
			frame.style.setProperty("--fl", `${rect.left}px`);
			frame.style.setProperty("--fr", `${window.innerWidth - rect.right}px`);
			frame.style.setProperty("--fb", `${window.innerHeight - rect.bottom}px`);
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(frame);
		window.addEventListener("resize", measure);
		return () => {
			observer.disconnect();
			window.removeEventListener("resize", measure);
		};
	}, []);

	/* layers drift against the pointer by their data-depth */
	useDrift(stageRef, !reducedMotion);

	const entering = phase !== "ready";
	const open = phase === "loading" || phase === "intro";
	const settled = phase === "settle" || phase === "ready";

	return (
		<RadioProvider>
			<a className="skip-link" href="#headline">
				skip to the headline
			</a>
			<SiteHeader
				mode={mode}
				onFocusWorld={setFocus}
				onMode={setMode}
				variant="home"
				visible={settled}
				wordmarkVisible={phase === "ready"}
			/>
			<main id="main">
				<section
					aria-labelledby="headline"
					className="stage"
					data-focus={focus ?? undefined}
					data-mode={mode}
					ref={stageRef}
				>
					<div
						className="frame"
						data-entering={entering || undefined}
						data-immediate={jumping || undefined}
						data-open={open || undefined}
						data-revealed={phase !== "loading" || undefined}
						ref={frameRef}
					>
						<SkyBack />
						<div className="wall-wrap fade">
							{immediate ? null : (
								<Loader
									leaving={phase !== "loading"}
									onReady={startIntro}
									onSkip={skip}
								/>
							)}
							<Ring
								cards={CARDS}
								focus={focus}
								immediate={immediate}
								playing={phase !== "loading"}
								reducedMotion={reducedMotion}
							/>
						</div>
						<SkyFront />
						<AgentView markdown={markdown} visible={mode === "agent"} />
					</div>
					<div className="below fade" data-revealed={settled || undefined}>
						<div className="sentence-wrap" id="headline">
							<Sentence onFocusWorld={setFocus} />
						</div>
						<dl className="meta">
							{stats.map((stat) => (
								<div key={stat.label}>
									<dt>{stat.label}</dt>
									<dd>{stat.value}</dd>
								</div>
							))}
						</dl>
					</div>
					<noscript>
						<style>
							{
								".loader,.loader-brand{display:none}.card{opacity:1!important}.site-header,.site-header *,.below,.word-mask>span{opacity:1!important;visibility:visible!important;transform:none!important}.frame{clip-path:inset(0 round 28px)!important}"
							}
						</style>
					</noscript>
				</section>
				{children}
			</main>
			{immediate ? null : (
				<LoaderBrand
					handedOff={phase === "ready"}
					leaving={phase !== "loading"}
				/>
			)}
			<CursorLabel enabled={phase === "ready" && mode === "human"} />
		</RadioProvider>
	);
}
