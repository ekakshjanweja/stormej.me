"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { playSfx } from "@/lib/sfx";
import { gsap, reducedMotion } from "../_lib/gsap";
import { setPhase } from "../_lib/phase";
import { letters } from "../_lib/split";

export const PRELOADER_SEEN = "strip:preloader-seen";

/* a phrase, one word at a time, then the name. first visit per tab only */
const WORDS = ["from", "idea", "to", "production."] as const;
const NAME = "ekaksh";

const waitForLoad = () =>
	new Promise<void>((resolve) => {
		const done = () => {
			/* two frames and a breath, so the first word never stutters */
			requestAnimationFrame(() =>
				requestAnimationFrame(() => setTimeout(resolve, 120))
			);
		};
		const fonts = document.fonts?.ready ?? Promise.resolve();
		fonts.then(() => {
			if (document.readyState === "complete") {
				done();
			} else {
				window.addEventListener("load", done, { once: true });
			}
		});
	});

const wordsTimeline = (stage: HTMLElement) => {
	const timeline = gsap.timeline();
	const words = stage.querySelectorAll<HTMLElement>("[data-pl-word]");
	words.forEach((word, index) => {
		const last = index === words.length - 1;
		timeline.call(() => playSfx("type"));
		timeline.fromTo(
			word,
			/* y: 0 drops the px offset gsap reads from the css start state */
			{ scale: last ? 0.88 : 1, y: 0, yPercent: 105 },
			{
				duration: last ? 0.52 : 0.42,
				ease: last ? "power4.out" : "power3.out",
				scale: 1,
				yPercent: 0,
			}
		);
		if (!last) {
			timeline.to(word, {
				delay: 0.26,
				duration: 0.28,
				ease: "power3.in",
				yPercent: -105,
			});
			timeline.to({}, { duration: 0.06 });
		}
	});
	timeline.to({}, { duration: 0.34 });
	timeline.to(stage, { autoAlpha: 0, duration: 0.45, ease: "power2.in" });
	return timeline;
};

const identityTimeline = (card: HTMLElement) => {
	const chars = card.querySelectorAll("[data-letter]");
	return (
		gsap
			.timeline()
			.set(card, { autoAlpha: 1 })
			/* the name, taken like a photo: the shutter falls as the flash
			   (charging from the start of this, see Preloader) goes off */
			.call(() => playSfx("shutter"), [], 0.27)
			.fromTo(
				chars,
				{ autoAlpha: 0, yPercent: 110 },
				{
					autoAlpha: 1,
					duration: 0.65,
					ease: "power3.out",
					stagger: 0.055,
					yPercent: 0,
				},
				0.1
			)
			.fromTo(
				card.querySelector("[data-rule]"),
				{ scaleX: 0 },
				{ duration: 0.55, ease: "power2.inOut", scaleX: 1 },
				0.55
			)
			.fromTo(
				card.querySelector("[data-sub]"),
				{ autoAlpha: 0, yPercent: 100 },
				{ autoAlpha: 1, duration: 0.6, ease: "power3.out", yPercent: 0 },
				0.75
			)
			.to({}, { duration: 0.7 })
			.to(chars, {
				duration: 0.45,
				ease: "power3.in",
				stagger: { each: 0.045, from: "end" },
				yPercent: -110,
			})
	);
};

export function Preloader() {
	const rootRef = useRef<HTMLDivElement>(null);
	const stageRef = useRef<HTMLDivElement>(null);
	const cardRef = useRef<HTMLDivElement>(null);
	const timelineRef = useRef<gsap.core.Timeline | null>(null);
	const [gone, setGone] = useState(false);

	const finish = useCallback(() => {
		sessionStorage.setItem(PRELOADER_SEEN, "1");
		document.documentElement.dataset.preloaderSeen = "";
		setPhase("ready");
		setGone(true);
	}, []);

	const skip = useCallback(() => {
		timelineRef.current?.kill();
		finish();
	}, [finish]);

	useEffect(() => {
		const seen = sessionStorage.getItem(PRELOADER_SEEN) !== null;
		if (seen || reducedMotion()) {
			finish();
			return;
		}
		const stage = stageRef.current;
		const card = cardRef.current;
		const root = rootRef.current;
		if (!(stage && card && root)) {
			return;
		}
		let cancelled = false;
		const onKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				skip();
			}
		};
		window.addEventListener("keydown", onKey);
		waitForLoad().then(() => {
			if (cancelled) {
				return;
			}
			timelineRef.current = gsap
				.timeline({ onComplete: finish })
				.add(wordsTimeline(stage))
				.add(identityTimeline(card))
				.to(card, { duration: 0.75, ease: "power2.inOut", scale: 1.04 }, "<")
				/* a flash as the dark lifts (it charges for a beat first), and the
				   page starts its entrance */
				.call(() => playSfx("flash"), [], "<")
				.call(() => setPhase("ready"), [], "<0.2")
				.to(root, { autoAlpha: 0, duration: 0.55, ease: "power2.inOut" }, "<");
		});
		return () => {
			cancelled = true;
			window.removeEventListener("keydown", onKey);
			timelineRef.current?.kill();
		};
	}, [finish, skip]);

	if (gone) {
		return null;
	}

	return (
		<div className="preloader" ref={rootRef}>
			<div aria-hidden="true" className="preloader-stage" ref={stageRef}>
				{WORDS.map((word) => (
					<span className="preloader-mask" key={word}>
						<span className="preloader-word" data-pl-word="">
							{word}
						</span>
					</span>
				))}
			</div>
			<div aria-hidden="true" className="preloader-card" ref={cardRef}>
				<span className="preloader-name">
					{letters(NAME).map(({ char, key }) => (
						<span className="preloader-letter-mask" key={key}>
							<span data-letter="">{char}</span>
						</span>
					))}
				</span>
				<span className="preloader-rule" data-rule="" />
				<span className="preloader-sub-mask">
					<span className="preloader-sub" data-sub="">
						early-stage engineer · delhi · 2026
					</span>
				</span>
			</div>
			<button className="preloader-skip" onClick={skip} type="button">
				skip intro <kbd>esc</kbd>
			</button>
		</div>
	);
}
