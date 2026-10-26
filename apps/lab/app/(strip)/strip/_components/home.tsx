"use client";

import { useCallback, useRef } from "react";
import { LINKS, PERSON, PLAYABLE_REELS, PORTRAITS, SITE } from "@/lib/profile";
import { playSfx } from "@/lib/sfx";
import {
	gsap,
	ScrollTrigger,
	SplitText,
	scrollToY,
	useEntrance,
} from "../_lib/gsap";
import { type Along, at } from "../_lib/reveals";
import { letters } from "../_lib/split";
import { PRACTICE_CARD, STACK_CARD } from "./about-cards";
import { DragReel } from "./drag-photo";
import { ExternalLink } from "./external-link";
import { type FacePhoto, Faces, type Spot } from "./faces";
import { HomeBuilds, HomeMore } from "./home-more";
import { LiquidButton } from "./liquid-button";
import { Magnetic, PillFace } from "./magnetic";
import { ReelCycle } from "./reel-cycle";
import { Sideways } from "./sideways";
import { WorkTabs } from "./work-tabs";

/* the desk reel, "one green square at a time", stands in for a portrait */
/* near the end: two faces in the open space above the giant name, away
   from the slogan */
/* reached for, each opens a card of what the about page said */
const END_FACES: FacePhoto[] = [
	{ ...PORTRAITS.shimla, card: PRACTICE_CARD },
	{ ...PORTRAITS.rooftop, card: STACK_CARD },
];
/* two spots, well apart, so one face's card never covers the other face.
   which face lands where still changes each visit */
const END_SPOTS: Spot[] = [
	{ left: "28%", size: 4.75, tilt: -7, top: "24%" },
	{ right: "9%", size: 4.25, tilt: 6, top: "30%" },
];

const HERO_REEL =
	PLAYABLE_REELS.find((reel) => reel.cover.includes("DejyibXiKjs")) ??
	PLAYABLE_REELS[0];

/* the hero, once the preloader or curtain lifts: masked lines rise and
   un-squash, the photo springs up */
const heroEntrance = () => {
	const lines = (selector: string, delay: number) => {
		for (const [index, element] of gsap.utils
			.toArray<HTMLElement>(selector)
			.entries()) {
			SplitText.create(element, {
				aria: "auto",
				autoSplit: true,
				mask: "lines",
				onSplit: (self) =>
					gsap.from(self.lines, {
						delay: delay + index * 0.08,
						duration: 1.1,
						ease: "expo.out",
						scaleY: 1.12,
						stagger: 0.06,
						transformOrigin: "left bottom",
						yPercent: 110,
					}),
				type: "lines",
			});
		}
	};
	lines("[data-hero-title]", 0);
	lines("[data-hero-sub]", 0.35);
	gsap.from("[data-hero-photo]", {
		autoAlpha: 0,
		duration: 1.2,
		ease: "back.out(1.4)",
		scale: 0.95,
		y: 30,
	});
};

/* scroll reveals, hung off the sideways tween when there is one */
const reveals = (along: Along) => {
	for (const word of gsap.utils.toArray<HTMLElement>("[data-strip-word]")) {
		gsap.from(word, {
			duration: 1.1,
			ease: "expo.out",
			scrollTrigger: { trigger: word, ...at(along, "85%") },
			yPercent: 110,
		});
	}

	const process = document.querySelector("[data-process]");
	if (process) {
		gsap
			.timeline({ scrollTrigger: { trigger: process, ...at(along, "75%") } })
			.from("[data-process-index]", {
				autoAlpha: 0,
				duration: 0.8,
				ease: "power3.out",
				y: 40,
			})
			.from(
				"[data-process-shot]",
				{ duration: 1.2, ease: "expo.out", scale: 0.88, stagger: 0.1 },
				0
			)
			.from(
				"[data-process-shot] img",
				{ duration: 1.5, ease: "expo.out", scale: 1.14 },
				0
			)
			.from(
				"[data-process-title] > span",
				{ duration: 1.1, ease: "expo.out", stagger: 0.06, yPercent: 110 },
				0.75
			);
	}

	for (const item of gsap.utils.toArray<HTMLElement>("[data-home-reveal]")) {
		gsap.from(item, {
			autoAlpha: 0,
			duration: 0.9,
			ease: "power3.out",
			scrollTrigger: { trigger: item, ...at(along, "90%") },
			y: 30,
		});
	}

	const contact = document.querySelector("[data-contact]");
	if (contact) {
		gsap
			.timeline({ scrollTrigger: { trigger: contact, ...at(along, "80%") } })
			.from("[data-role] > span", {
				duration: 0.9,
				ease: "power3.out",
				stagger: 0.08,
				yPercent: 110,
			})
			.from(
				"[data-giant] > span",
				{ duration: 1.1, ease: "expo.out", stagger: 0.06, yPercent: 100 },
				0.1
			);
	}

	const gradient = document.querySelector("[data-gradient]");
	if (gradient && along) {
		gsap.fromTo(
			gradient,
			{ scaleX: 0.05 },
			{
				ease: "none",
				scaleX: 1.02,
				scrollTrigger: {
					containerAnimation: along,
					end: "right 60%",
					scrub: true,
					start: "left right",
					trigger: gradient,
				},
				transformOrigin: "left center",
			}
		);
	}

	cameraFlash(along);
};

/* the orb, nearly full, goes off like a camera flash: it charges, the frame
   blows out white with a streak across it, and a warm afterimage burns off
   back into the dusk. only ever forwards, and never under reduced motion
   (reveals don't run then) */
const ORB_FILTER = "blur(40px) saturate(0.85) brightness(1)";
const FLASH_COOLDOWN_MS = 4000;
/* the flash cue whines for this long before it pops */
const FLASH_CHARGE = 0.27;

const cameraFlash = (along: Along) => {
	const flash = document.querySelector<HTMLElement>("[data-flash]");
	const orb = document.querySelector<HTMLElement>("[data-gradient]");
	const panel = orb?.parentElement;
	if (!(flash && orb && panel)) {
		return;
	}
	const white = flash.querySelector("[data-flash-white]");
	const burn = flash.querySelector("[data-flash-burn]");
	const streak = flash.querySelector("[data-flash-streak]");
	let last = Number.NEGATIVE_INFINITY;

	const fire = () => {
		const now = performance.now();
		if (now - last < FLASH_COOLDOWN_MS) {
			return;
		}
		last = now;
		/* the burst starts from the orb's hot centre */
		const box = orb.getBoundingClientRect();
		flash.style.setProperty("--fx", `${box.left + box.width * 0.5}px`);
		flash.style.setProperty("--fy", `${box.top + box.height * 0.5}px`);
		playSfx("flash");

		const pop = FLASH_CHARGE;
		gsap
			.timeline({ onComplete: () => gsap.set(orb, { clearProps: "filter" }) })
			.set(flash, { visibility: "visible" })
			/* the charge: the orb heats up */
			.fromTo(
				orb,
				{ filter: ORB_FILTER },
				{
					duration: pop,
					ease: "power2.in",
					filter: "blur(40px) saturate(0.85) brightness(1.8)",
				},
				0
			)
			.fromTo(
				burn,
				{ opacity: 0 },
				{ duration: pop, ease: "power2.in", opacity: 0.3 },
				0
			)
			/* the pop */
			.call(() => playSfx("shutter"), [], pop)
			.fromTo(
				white,
				{ "--flash-r": "150%", opacity: 0 },
				{ duration: 0.03, opacity: 1 },
				pop
			)
			.to(burn, { duration: 0.05, opacity: 1 }, pop)
			.to(
				orb,
				{ duration: 0.05, filter: "blur(40px) saturate(0.85) brightness(4)" },
				pop
			)
			.fromTo(
				streak,
				{ opacity: 1, scaleX: 0.15 },
				{ duration: 0.4, ease: "expo.out", scaleX: 1.8 },
				pop
			)
			/* held white for a beat, then the burn lingers and fades */
			.to(
				white,
				{ "--flash-r": "14%", duration: 1.3, ease: "power3.inOut" },
				pop + 0.12
			)
			.to(white, { duration: 1.3, ease: "power2.in", opacity: 0 }, pop + 0.12)
			.to(streak, { duration: 0.7, ease: "power2.out", opacity: 0 }, pop + 0.12)
			.to(burn, { duration: 2.4, ease: "power2.out", opacity: 0 }, pop + 0.2)
			.to(
				orb,
				{ duration: 2.2, ease: "power2.out", filter: ORB_FILTER },
				pop + 0.15
			)
			.set(flash, { visibility: "hidden" });
	};

	ScrollTrigger.create({ onEnter: fire, trigger: panel, ...at(along, "8%") });
};

export function Home() {
	const rootRef = useRef<HTMLDivElement>(null);

	useEntrance(rootRef, heroEntrance);

	const backToStart = useCallback(() => {
		scrollToY(0);
		document.getElementById("strip-main")?.focus({ preventScroll: true });
	}, []);

	return (
		<div className="home" ref={rootRef}>
			<Sideways reveal={reveals}>
				<section aria-labelledby="hero-name" className="s-intro">
					<div className="s-intro-left">
						<p className="s-index">01/</p>
						<p className="s-note">
							from delhi,
							<br />
							with good coffee
						</p>
						<h1 className="s-name" data-hero-title="" id="hero-name">
							{PERSON.first}
							<br />
							{PERSON.last}
						</h1>
					</div>
					<div className="s-intro-right">
						<p className="s-role" data-hero-title="">
							early-stage
							<br />
							<em>engineer</em>
						</p>
						<div className="s-intro-row">
							<div className="s-based">
								<span aria-hidden="true" className="s-arrow">
									→
								</span>
								<p data-hero-sub="">
									based in delhi, building
									<br />
									products from idea
									<br />
									to production.
								</p>
							</div>
							<div className="s-photo" data-hero-photo="">
								<DragReel
									alt="ekaksh's desk, a github contribution graph above the monitors: one green square at a time"
									reel={HERO_REEL}
								/>
							</div>
						</div>
					</div>
				</section>

				<section aria-labelledby="expert-title" className="s-expert">
					<div className="s-expert-left">
						<p className="s-index">02/</p>
						<h2 className="s-small-title" id="expert-title">
							i build the product,
							<br />
							and the plumbing behind it
						</h2>
						<ReelCycle />
					</div>
					<div className="s-expert-right">
						<ul aria-label="what i do" className="s-words">
							<li className="s-word-mask">
								<span data-strip-word="">mobile</span>
							</li>
							<li className="s-word-mask">
								<em data-strip-word="">ai</em>
							</li>
							<li className="s-word-mask">
								<span data-strip-word="">native</span>
							</li>
							<li className="s-word-mask">
								<span data-strip-word="">full stack</span>
							</li>
						</ul>
						<LiquidButton href={`${SITE}/work`} label="work">
							see the work
						</LiquidButton>
					</div>
				</section>

				<WorkTabs />

				<HomeBuilds />

				<section
					aria-labelledby="contact-title"
					className="s-contact"
					data-contact=""
				>
					<Faces className="faces-home" photos={END_FACES} spots={END_SPOTS} />
					<p className="s-index">04/</p>
					<p className="s-role-line" data-role="">
						<span>early-stage engineer</span>
						<span>+ problem solver</span>
					</p>
					<h2 className="s-slogan" id="contact-title">
						turning messy ideas
						<br />
						into fast, polished software
					</h2>
					<p aria-hidden="true" className="s-giant" data-giant="">
						{letters(PERSON.first).map(({ char, key }) => (
							<span key={key}>{char}</span>
						))}
					</p>
				</section>

				{/* the music closes the strip, just before the chat */}
				<HomeMore />

				<div aria-hidden="true" className="s-gradient">
					<span className="s-orb" data-gradient="" />
				</div>

				<section aria-labelledby="outro-title" className="s-outro">
					<h2 className="s-chat" id="outro-title">
						let's have
						<br />
						<em>a chat</em>
					</h2>
					<span aria-hidden="true" className="s-rule" />
					<div className="s-pills">
						<Magnetic>
							<a className="pill" href={`mailto:${PERSON.email}`}>
								<PillFace>{PERSON.email}</PillFace>
							</a>
						</Magnetic>
						<Magnetic>
							<ExternalLink className="pill" href={LINKS.cal}>
								<PillFace>book a call</PillFace>
							</ExternalLink>
						</Magnetic>
						<Magnetic>
							<button className="pill" onClick={backToStart} type="button">
								<PillFace>← back to the start</PillFace>
							</button>
						</Magnetic>
					</div>
				</section>
			</Sideways>

			{/* the orb's camera flash, over everything while it fires */}
			<div aria-hidden="true" className="s-flash" data-flash="">
				<span className="s-flash-white" data-flash-white="" />
				<span className="s-flash-burn" data-flash-burn="" />
				<span className="s-flash-streak" data-flash-streak="" />
			</div>
		</div>
	);
}
