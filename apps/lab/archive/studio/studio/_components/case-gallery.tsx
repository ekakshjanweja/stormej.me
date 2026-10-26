"use client";

import Image from "next/image";
import { type CSSProperties, type RefObject, useEffect, useRef } from "react";
import type { Case } from "@/lib/cases";
import { gsap, isTouch, reducedMotion, ScrollTrigger } from "../_lib/gsap";
import { pad, screenName } from "../_lib/pages";
import { sizeOf } from "../_lib/sizes";

/* the screens, in whatever shape the case has:
   - four or more phone shots: a strip that holds the screen while the page
     scrolls it sideways (a plain swipeable row on touch, small screens and
     with reduced motion)
   - two or three: the same row, no pinning
   - mac and web shots: cards that stick and stack, the ones underneath
     easing back as the next arrives
   - no screens at all: the short version, set big, on the same stack */

const MIN_PINNED = 4;

const canStage = () =>
	!(reducedMotion() || isTouch()) && window.innerWidth >= 768;

function GalleryHead({ count, label }: { count: string; label: string }) {
	return (
		<div className="case-gallery-head">
			<h2 className="case-label" id="gallery-title">
				{label}
			</h2>
			<p className="case-gallery-count">{count}</p>
		</div>
	);
}

function PhoneTrack({ item }: { item: Case }) {
	const sectionRef = useRef<HTMLElement>(null);
	const trackRef = useRef<HTMLUListElement>(null);
	const barRef = useRef<HTMLSpanElement>(null);
	const pinned = item.gallery.length >= MIN_PINNED;

	useEffect(() => {
		const section = sectionRef.current;
		const track = trackRef.current;
		if (!(section && track && pinned && canStage())) {
			return;
		}
		section.classList.add("is-staged");
		const distance = () =>
			Math.max(0, track.scrollWidth - document.documentElement.clientWidth);
		const setHeight = () => {
			section.style.setProperty("--track-distance", `${distance()}px`);
		};
		setHeight();
		ScrollTrigger.addEventListener("refreshInit", setHeight);
		const context = gsap.context(() => {
			const timeline = gsap.timeline({
				scrollTrigger: {
					end: "bottom bottom",
					invalidateOnRefresh: true,
					scrub: 0,
					start: "top top",
					trigger: section,
				},
			});
			timeline
				.to(track, { ease: "none", x: () => -distance() }, 0)
				.fromTo(barRef.current, { scaleX: 0 }, { ease: "none", scaleX: 1 }, 0);
		}, section);
		ScrollTrigger.refresh();
		return () => {
			ScrollTrigger.removeEventListener("refreshInit", setHeight);
			context.revert();
			section.classList.remove("is-staged");
			section.style.removeProperty("--track-distance");
		};
	}, [pinned]);

	return (
		<section
			aria-labelledby="gallery-title"
			className={`case-gallery is-phones${pinned ? "" : "is-few"}`}
			ref={sectionRef}
		>
			<div className="track-stage">
				<GalleryHead
					count={`${pad(item.gallery.length)} screens`}
					label="screens"
				/>
				<section
					aria-label={`${item.title} screens, scrolls sideways`}
					className="track-scroller"
					// biome-ignore lint/a11y/noNoninteractiveTabindex: a scrollable strip has to be reachable from the keyboard
					tabIndex={0}
				>
					<ul className="track" ref={trackRef}>
						{item.gallery.map((src, index) => {
							const [width, height] = sizeOf(src);
							return (
								<li
									className="track-item"
									key={src}
									style={
										{ aspectRatio: `${width} / ${height}` } as CSSProperties
									}
								>
									<Image
										alt={`${item.title} screen ${index + 1}`}
										height={height}
										sizes="(max-width: 767px) 64vw, 320px"
										src={src}
										width={width}
									/>
								</li>
							);
						})}
					</ul>
				</section>
				{pinned ? (
					<span aria-hidden="true" className="track-progress">
						<span className="track-progress-bar" ref={barRef} />
					</span>
				) : null}
			</div>
		</section>
	);
}

/** sticky cards; each one eases back as the next slides over it */
function useStack(listRef: RefObject<HTMLOListElement | null>) {
	useEffect(() => {
		const list = listRef.current;
		if (!list || reducedMotion()) {
			return;
		}
		const cards = gsap.utils.toArray<HTMLElement>(".stack-card", list);
		const context = gsap.context(() => {
			cards.forEach((card, index) => {
				const next = cards[index + 1];
				if (!next) {
					return;
				}
				gsap.to(card.querySelector(".stack-card-inner"), {
					ease: "none",
					scale: 0.9,
					scrollTrigger: {
						end: "top 20%",
						scrub: 0,
						start: "top bottom",
						trigger: next,
					},
				});
				gsap.to(card.querySelector(".stack-card-shade"), {
					ease: "none",
					opacity: 0.28,
					scrollTrigger: {
						end: "top 20%",
						scrub: 0,
						start: "top bottom",
						trigger: next,
					},
				});
			});
		}, list);
		return () => context.revert();
	}, [listRef]);
}

function WideStack({ item }: { item: Case }) {
	const listRef = useRef<HTMLOListElement>(null);
	useStack(listRef);

	if (item.gallery.length === 1) {
		const [src] = item.gallery;
		const [width, height] = sizeOf(src ?? "");
		return (
			<section
				aria-labelledby="gallery-title"
				className="case-gallery is-single"
			>
				<GalleryHead count="01 screen" label="screens" />
				{src ? (
					<figure className="single-shot">
						<Image
							alt={`${item.title} screen 1`}
							height={height}
							sizes="(max-width: 767px) 100vw, 800px"
							src={src}
							width={width}
						/>
					</figure>
				) : null}
			</section>
		);
	}

	return (
		<section aria-labelledby="gallery-title" className="case-gallery is-wide">
			<GalleryHead
				count={`${pad(item.gallery.length)} screens`}
				label="screens"
			/>
			<ol className="stack" ref={listRef}>
				{item.gallery.map((src, index) => {
					const [width, height] = sizeOf(src);
					const name = screenName(src, item.title);
					return (
						<li
							className="stack-card"
							key={src}
							style={{ "--i": index } as CSSProperties}
						>
							<figure className="stack-card-inner is-shot">
								<Image
									alt={`${item.title} screen ${index + 1}`}
									height={height}
									sizes="(max-width: 767px) 100vw, 1100px"
									src={src}
									width={width}
								/>
								<figcaption className="stack-card-caption">
									{pad(index + 1)}
									{name ? ` · ${name}` : ""}
								</figcaption>
								<span aria-hidden="true" className="stack-card-shade" />
							</figure>
						</li>
					);
				})}
			</ol>
		</section>
	);
}

function TypeDeck({ item }: { item: Case }) {
	const listRef = useRef<HTMLOListElement>(null);
	useStack(listRef);

	return (
		<section aria-labelledby="gallery-title" className="case-gallery is-type">
			<GalleryHead
				count={`${pad(item.tldr.length)} points`}
				label="the short version"
			/>
			<ol className="stack" ref={listRef}>
				{item.tldr.map((line, index) => (
					<li
						className="stack-card"
						key={line}
						style={{ "--i": index } as CSSProperties}
					>
						<div className="stack-card-inner is-line">
							<span aria-hidden="true" className="stack-card-index">
								{pad(index + 1)} / {pad(item.tldr.length)}
							</span>
							<p className="stack-card-line">{line}</p>
							<span aria-hidden="true" className="stack-card-shade" />
						</div>
					</li>
				))}
			</ol>
		</section>
	);
}

export function CaseGallery({ item }: { item: Case }) {
	if (item.gallery.length === 0) {
		return <TypeDeck item={item} />;
	}
	if (item.galleryShape === "wide") {
		return <WideStack item={item} />;
	}
	return <PhoneTrack item={item} />;
}
