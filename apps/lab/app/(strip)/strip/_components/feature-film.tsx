"use client";

import {
	type CSSProperties,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import type { Project } from "@/lib/profile";
import { playSfx } from "@/lib/sfx";
import { getLenis, gsap, reducedMotion } from "../_lib/gsap";
import { playingFlags } from "../_lib/playing";
import { giveSound, takeSound } from "../_lib/sound";
import { PageLink } from "./page-link";
import { ProgressiveImage } from "./progressive-image";
import { SoundButton } from "./sound-button";

const OPEN_SECONDS = 0.85;
const CLOSE_SECONDS = 0.55;

/* a project's clip, small on the strip: a muted loop while it's on screen.
   reach in and it opens out of where it sits into the full film, out loud
   (it opens because of a click, so the browser allows the sound). esc,
   close or a click outside folds it back into its place. the project's own
   page is a "view more" away, from the card and from the film */
export function FeatureFilm({ project }: { project: Project }) {
	const previewRef = useRef<HTMLVideoElement>(null);
	const thumbRef = useRef<HTMLButtonElement>(null);
	const dialogRef = useRef<HTMLDialogElement>(null);
	const frameRef = useRef<HTMLDivElement>(null);
	const filmRef = useRef<HTMLVideoElement>(null);
	const closingRef = useRef(false);
	const [audible, setAudible] = useState(true);
	const [progress, setProgress] = useState(0);
	const film = project.film ?? project.video;

	/* the small loop plays only while it can be seen */
	useEffect(() => {
		const video = previewRef.current;
		if (!video || reducedMotion()) {
			return;
		}
		const observer = new IntersectionObserver(([entry]) => {
			if (entry?.isIntersecting && !dialogRef.current?.open) {
				video.play().catch(() => undefined);
			} else {
				video.pause();
			}
		});
		observer.observe(video);
		return () => observer.disconnect();
	}, []);

	/* the frame's offset from the card, as a transform that puts it back */
	const fromCard = useCallback(() => {
		const thumb = thumbRef.current?.getBoundingClientRect();
		const frame = frameRef.current?.getBoundingClientRect();
		if (!(thumb && frame)) {
			return { scaleX: 1, scaleY: 1, x: 0, y: 0 };
		}
		return {
			scaleX: thumb.width / frame.width,
			scaleY: thumb.height / frame.height,
			x: thumb.left - frame.left,
			y: thumb.top - frame.top,
		};
	}, []);

	const open = useCallback(() => {
		const dialog = dialogRef.current;
		const video = filmRef.current;
		if (!(dialog && video) || dialog.open) {
			return;
		}
		closingRef.current = false;
		delete dialog.dataset.closing;
		previewRef.current?.pause();
		dialog.showModal();
		getLenis()?.stop();
		playSfx("grow");
		video.currentTime = 0;
		giveSound(video);
		if (reducedMotion()) {
			return;
		}
		gsap.fromTo(
			frameRef.current,
			{ ...fromCard(), transformOrigin: "0 0" },
			{
				duration: OPEN_SECONDS,
				ease: "expo.out",
				scaleX: 1,
				scaleY: 1,
				x: 0,
				y: 0,
			}
		);
		gsap.fromTo(
			dialog.querySelector("[data-film-side]"),
			{ autoAlpha: 0, y: 16 },
			{ autoAlpha: 1, delay: 0.3, duration: 0.5, ease: "power3.out", y: 0 }
		);
	}, [fromCard]);

	const close = useCallback(() => {
		const dialog = dialogRef.current;
		const video = filmRef.current;
		if (!(dialog?.open && video) || closingRef.current) {
			return;
		}
		closingRef.current = true;
		video.pause();
		takeSound(video);
		playSfx("close");
		if (reducedMotion()) {
			dialog.close();
			return;
		}
		dialog.dataset.closing = "";
		gsap.to(dialog.querySelector("[data-film-side]"), {
			autoAlpha: 0,
			duration: 0.2,
		});
		gsap.to(frameRef.current, {
			...fromCard(),
			duration: CLOSE_SECONDS,
			ease: "expo.inOut",
			onComplete: () => {
				dialog.close();
				gsap.set(frameRef.current, { clearProps: "transform" });
			},
		});
	}, [fromCard]);

	const toggleSound = useCallback(() => {
		const video = filmRef.current;
		if (!video) {
			return;
		}
		if (video.muted) {
			giveSound(video);
		} else {
			takeSound(video);
		}
	}, []);

	/* a click on the film pauses it, another carries on */
	const togglePlay = useCallback(() => {
		const video = filmRef.current;
		if (!video) {
			return;
		}
		if (video.paused) {
			video.play().catch(() => undefined);
		} else {
			video.pause();
		}
	}, []);

	useEffect(() => {
		const dialog = dialogRef.current;
		const video = filmRef.current;
		if (!(dialog && video)) {
			return;
		}
		/* esc folds it back like the close button, instead of snapping shut */
		const onCancel = (event: Event) => {
			event.preventDefault();
			close();
		};
		/* a click on the backdrop lands on the dialog itself */
		const onClick = (event: MouseEvent) => {
			if (event.target === dialog) {
				close();
			}
		};
		const onClosed = () => {
			video.pause();
			takeSound(video);
			getLenis()?.start();
			thumbRef.current?.focus({ preventScroll: true });
			if (!reducedMotion()) {
				previewRef.current?.play().catch(() => undefined);
			}
		};
		const onVolume = () => setAudible(!video.muted);
		const onTime = () =>
			setProgress(video.duration ? video.currentTime / video.duration : 0);
		dialog.addEventListener("cancel", onCancel);
		dialog.addEventListener("click", onClick);
		dialog.addEventListener("close", onClosed);
		video.addEventListener("volumechange", onVolume);
		video.addEventListener("timeupdate", onTime);
		return () => {
			dialog.removeEventListener("cancel", onCancel);
			dialog.removeEventListener("click", onClick);
			dialog.removeEventListener("close", onClosed);
			video.removeEventListener("volumechange", onVolume);
			video.removeEventListener("timeupdate", onTime);
		};
	}, [close]);

	return (
		<div className="hm-feature">
			<button
				aria-haspopup="dialog"
				aria-label={`play the ${project.title} film${project.film ? ", with sound" : ""}`}
				className="hm-feature-frame"
				data-cursor="view"
				data-cursor-label="play"
				onClick={open}
				ref={thumbRef}
				type="button"
			>
				{project.image ? (
					<ProgressiveImage alt="" fill sizes="40vw" src={project.image} />
				) : null}
				{project.video ? (
					<video
						aria-hidden="true"
						className="hm-build-video"
						{...playingFlags}
						loop
						muted
						playsInline
						preload="none"
						ref={previewRef}
						src={project.video}
						tabIndex={-1}
					/>
				) : null}
				<span aria-hidden="true" className="hm-feature-play">
					<span className="hm-feature-play-icon" />
					{project.film ? "play with sound" : "play"}
				</span>
			</button>
			<FeatureCaption project={project} />

			<dialog
				aria-label={`${project.title}, the film`}
				className="film"
				ref={dialogRef}
			>
				<div className="film-body">
					<div className="film-frame" ref={frameRef}>
						{/* biome-ignore lint/a11y/useMediaCaption: no caption files exist for these films yet */}
						<video
							aria-label={`${project.title}, the film`}
							loop
							onClick={togglePlay}
							playsInline
							poster={project.image}
							preload="none"
							ref={filmRef}
							src={film}
						/>
						<span
							aria-hidden="true"
							className="film-progress"
							style={{ "--progress": progress } as CSSProperties}
						/>
					</div>
					<div className="film-side" data-film-side="">
						<div>
							<p className="film-title">{project.title}</p>
							<p className="film-meta">{project.summary}</p>
						</div>
						<div className="film-actions">
							<SoundButton
								audible={audible}
								label={`${project.title} film sound`}
								onToggle={toggleSound}
								tone="paper"
							/>
							<PageLink
								className="film-more"
								data-cursor="nav"
								href={project.href}
								label={project.title}
							>
								view more <span aria-hidden="true">→</span>
							</PageLink>
							<button className="film-close" onClick={close} type="button">
								close <kbd>esc</kbd>
							</button>
						</div>
					</div>
				</div>
			</dialog>
		</div>
	);
}

/** what sits under a project's frame: its name, a line about it, when and
    with what, and the way to its own page */
export function FeatureCaption({ project }: { project: Project }) {
	return (
		<>
			<p className="hm-build-name">{project.title}</p>
			<p className="hm-build-meta">{project.summary}</p>
			<p className="hm-build-stack">
				{[String(project.year), ...project.stack].join(" · ")}
			</p>
			<PageLink
				className="s-detail hm-feature-more"
				data-cursor="nav"
				href={project.href}
				label={project.title}
			>
				view more <span aria-hidden="true">→</span>
			</PageLink>
		</>
	);
}
