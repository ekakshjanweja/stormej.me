"use client";

import Image from "next/image";
import {
	type CSSProperties,
	createContext,
	type ReactNode,
	use,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { playSfx } from "@/lib/sfx";
import {
	playedAgo,
	type SpotifyStatus,
	type SpotifyTrack,
	useSpotify,
} from "@/lib/use-spotify";
import { stopClip, toggleClip, useClip } from "../_lib/clip";
import { getLenis, gsap, reducedMotion, ScrollTrigger } from "../_lib/gsap";
import { useMovable } from "../_lib/movable";
import { ExternalLink } from "./external-link";

/* what's on the speakers. one poll for the whole visit, shared by the
   little chip by the footer, the menu and the about page. until spotify
   answers (and wherever it isn't set up) all of it renders nothing */

const SpotifyContext = createContext<SpotifyStatus | null>(null);

export function SpotifyProvider({ children }: { children: ReactNode }) {
	const status = useSpotify();
	return <SpotifyContext value={status}>{children}</SpotifyContext>;
}

const useStatus = () => use(SpotifyContext);

/* four bars that dance while something plays (still with reduced motion,
   via .sound-bars) */
function Bars({ on }: { on: boolean }) {
	return (
		<span aria-hidden="true" className="sound-bars" data-on={on}>
			<span />
			<span />
			<span />
			<span />
		</span>
	);
}

const whenLine = (status: SpotifyStatus) => {
	if (status.isPlaying) {
		return "now playing";
	}
	return status.playedAt
		? `last played · ${playedAgo(status.playedAt)}`
		: "last played";
};

function Cover({ sizes, track }: { sizes: string; track: SpotifyTrack }) {
	if (!track.albumArt) {
		return <span aria-hidden="true" className="spin-blank" />;
	}
	return (
		<Image
			alt={`${track.album} cover`}
			fill
			sizes={sizes}
			src={track.albumArt}
		/>
	);
}

/** the small one: a chip by the footer on wide screens, a line in the menu */
export function SpotifyMini({ className }: { className?: string }) {
	const status = useStatus();
	const track = status?.track;
	if (!(status && track)) {
		return null;
	}
	return (
		<p className={className ? `spin ${className}` : "spin"}>
			<ExternalLink className="spin-link" data-cursor="nav" href={track.url}>
				<span className="spin-cover">
					<Cover sizes="32px" track={track} />
				</span>
				<span className="spin-text">
					<span className="spin-when">
						<Bars on={status.isPlaying} />
						{whenLine(status)}
					</span>
					<span className="spin-track">
						{track.title} <span className="spin-by">· {track.artists}</span>
					</span>
				</span>
			</ExternalLink>
		</p>
	);
}

/** one of the month's most played, as a record in a crate: its sleeve, and
    the vinyl tucked behind it. reach for it and the record slides half out;
    play it (where there's a clip) and it stays out and spins while a bit of
    the song plays. pull it out of the row and it springs back */
function Record({
	position,
	track,
}: {
	position: number;
	track: SpotifyTrack;
}) {
	const ref = useRef<HTMLLIElement>(null);
	useMovable(ref, { home: true });
	const clip = useClip();
	const { preview } = track;
	const active = preview !== null && clip.src === preview;
	const play = useCallback(() => {
		if (preview) {
			toggleClip(preview);
		}
	}, [preview]);

	return (
		<li
			className="rec"
			data-playing={active ? "" : undefined}
			ref={ref}
			style={{ "--clip": active ? clip.progress : 0 } as CSSProperties}
		>
			<div className="rec-stack">
				<span aria-hidden="true" className="rec-disc">
					<span className="rec-vinyl">
						<span className="rec-label">
							<Cover sizes="96px" track={track} />
						</span>
					</span>
				</span>
				{preview ? (
					<button
						aria-label={`${active ? "stop" : "play a bit of"} ${track.title}`}
						aria-pressed={active}
						className="rec-sleeve clip"
						data-cursor="view"
						data-cursor-label={active ? "stop" : "play"}
						data-playing={active ? "" : undefined}
						data-sfx="silent"
						onClick={play}
						type="button"
					>
						<Cover sizes="(min-width: 1200px) 26vh, 45vw" track={track} />
						<span aria-hidden="true" className="clip-badge">
							<span className="clip-icon" />
						</span>
					</button>
				) : (
					<span className="rec-sleeve">
						<Cover sizes="(min-width: 1200px) 26vh, 45vw" track={track} />
					</span>
				)}
			</div>
			<ExternalLink className="rec-text" data-cursor="nav" href={track.url}>
				<span aria-hidden="true" className="rec-index">
					{String(position + 1).padStart(2, "0")}
				</span>
				<span className="rec-title">{track.title}</span>
				<span className="rec-by">{track.artists}</span>
			</ExternalLink>
		</li>
	);
}

/* records in the crate: a two by two grid */
const CRATE = 4;

/** "1:21" */
const clock = (ms: number) => {
	const seconds = Math.floor(ms / 1000);
	return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
};

const TICK_MS = 1000;

/** a little record that plays a bit of its song when pressed, where there's
    a clip (the ring runs round its badge as it goes); without one it's just
    the record. `kind` names its classes: np-play, np-disc, np-label */
function ClipDisc({
	kind,
	sizes,
	spin = false,
	track,
}: {
	kind: "np";
	sizes: string;
	/** turning whether or not the clip is playing */
	spin?: boolean;
	track: SpotifyTrack;
}) {
	const clip = useClip();
	const { preview } = track;
	const active = preview !== null && clip.src === preview;
	const play = useCallback(() => {
		if (preview) {
			toggleClip(preview);
		}
	}, [preview]);
	const disc = (
		<span aria-hidden="true" className={`${kind}-disc`}>
			<span className={`${kind}-label`}>
				<Cover sizes={sizes} track={track} />
			</span>
		</span>
	);

	if (!preview) {
		return (
			<span className={`${kind}-play`} data-spinning={spin ? "" : undefined}>
				{disc}
			</span>
		);
	}
	return (
		<button
			aria-label={`${active ? "stop" : "play a bit of"} ${track.title}`}
			aria-pressed={active}
			className={`${kind}-play clip`}
			data-cursor="view"
			data-cursor-label={active ? "stop" : "play"}
			data-playing={active ? "" : undefined}
			data-sfx="silent"
			data-spinning={spin || active ? "" : undefined}
			onClick={play}
			style={{ "--clip": active ? clip.progress : 0 } as CSSProperties}
			type="button"
		>
			{disc}
			<span aria-hidden="true" className="clip-badge">
				<span className="clip-icon" />
			</span>
		</button>
	);
}

/** how far into the song it is now: spotify's answer carried forward by
    the time since it was asked, ticking each second */
const useElapsed = (status: SpotifyStatus) => {
	const [now, setNow] = useState(() => Date.now());
	useEffect(() => {
		const timer = window.setInterval(() => setNow(Date.now()), TICK_MS);
		return () => window.clearInterval(timer);
	}, []);
	const duration = status.durationMs ?? 0;
	const elapsed =
		status.progressMs === null
			? 0
			: Math.min(duration, status.progressMs + (now - status.fetchedAt));
	return { duration, elapsed };
};

function Progress({
	className,
	duration,
	elapsed,
}: {
	className: string;
	duration: number;
	elapsed: number;
}) {
	if (duration <= 0) {
		return null;
	}
	return (
		<span aria-hidden="true" className={className}>
			<span className="np-bar">
				<span style={{ transform: `scaleX(${elapsed / duration})` }} />
			</span>
			<span className="np-clock">
				{clock(elapsed)} / {clock(duration)}
			</span>
		</span>
	);
}

const OPEN_SECONDS = 0.8;
const CLOSE_SECONDS = 0.5;

/** what's playing right now (or was last), over the crate: a quiet pill
    with the record in it, turning while something plays (press it for a
    bit of the song), the song, and how far in it is, or how long ago. press
    the rest of it and it opens out into a big view of the same, which
    folds back into the pill when closed */
function NowPlaying({
	status,
	track,
}: {
	status: SpotifyStatus;
	track: SpotifyTrack;
}) {
	const { duration, elapsed } = useElapsed(status);
	const cardRef = useRef<HTMLDivElement>(null);
	const openRef = useRef<HTMLButtonElement>(null);
	const dialogRef = useRef<HTMLDialogElement>(null);
	const stageRef = useRef<HTMLDivElement>(null);
	const closingRef = useRef(false);
	const clip = useClip();
	const { preview } = track;
	const clipping = preview !== null && clip.src === preview;

	/* the stage's offset from the card, as a transform that puts it back */
	const fromCard = useCallback(() => {
		const card = cardRef.current?.getBoundingClientRect();
		const stage = stageRef.current?.getBoundingClientRect();
		if (!(card && stage)) {
			return { scaleX: 1, scaleY: 1, x: 0, y: 0 };
		}
		return {
			scaleX: card.width / stage.width,
			scaleY: card.height / stage.height,
			x: card.left - stage.left,
			y: card.top - stage.top,
		};
	}, []);

	const open = useCallback(() => {
		const dialog = dialogRef.current;
		if (!dialog || dialog.open) {
			return;
		}
		closingRef.current = false;
		delete dialog.dataset.closing;
		dialog.showModal();
		getLenis()?.stop();
		playSfx("grow");
		if (reducedMotion()) {
			return;
		}
		gsap.fromTo(
			stageRef.current,
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
			dialog.querySelector("[data-npx-side]"),
			{ autoAlpha: 0, y: 16 },
			{ autoAlpha: 1, delay: 0.25, duration: 0.5, ease: "power3.out", y: 0 }
		);
	}, [fromCard]);

	const close = useCallback(() => {
		const dialog = dialogRef.current;
		if (!dialog?.open || closingRef.current) {
			return;
		}
		closingRef.current = true;
		playSfx("close");
		if (reducedMotion()) {
			dialog.close();
			return;
		}
		dialog.dataset.closing = "";
		gsap.to(dialog.querySelector("[data-npx-side]"), {
			autoAlpha: 0,
			duration: 0.2,
		});
		gsap.to(stageRef.current, {
			...fromCard(),
			duration: CLOSE_SECONDS,
			ease: "expo.inOut",
			onComplete: () => {
				dialog.close();
				gsap.set(stageRef.current, { clearProps: "transform" });
			},
		});
	}, [fromCard]);

	const playBit = useCallback(() => {
		if (preview) {
			toggleClip(preview);
		}
	}, [preview]);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) {
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
			getLenis()?.start();
			openRef.current?.focus({ preventScroll: true });
		};
		dialog.addEventListener("cancel", onCancel);
		dialog.addEventListener("click", onClick);
		dialog.addEventListener("close", onClosed);
		return () => {
			dialog.removeEventListener("cancel", onCancel);
			dialog.removeEventListener("click", onClick);
			dialog.removeEventListener("close", onClosed);
		};
	}, [close]);

	/* playing now, or the last thing that was */
	const live = status.isPlaying;
	const heard = live ? "now playing" : "last played";
	const ago = status.playedAt ? playedAgo(status.playedAt) : null;

	return (
		<div className="np" ref={cardRef}>
			<ClipDisc kind="np" sizes="64px" spin={live} track={track} />
			<button
				aria-haspopup="dialog"
				aria-label={`${heard}: ${track.title} by ${track.artists}. open it out`}
				className="np-body"
				data-cursor="view"
				data-cursor-label="open"
				onClick={open}
				ref={openRef}
				type="button"
			>
				<span className="np-when">
					<Bars on={live} />
					{live ? "live" : (ago ?? "a while ago")}
					{live && duration > 0
						? ` · ${clock(elapsed)} / ${clock(duration)}`
						: null}
					<span aria-hidden="true" className="np-open">
						↗
					</span>
				</span>
				<span className="np-title">{track.title}</span>
			</button>

			<dialog
				aria-label={`${heard}: ${track.title}`}
				className="film npx"
				ref={dialogRef}
			>
				<div className="npx-body">
					<div className="npx-stage" ref={stageRef}>
						<span
							aria-hidden="true"
							className="npx-vinyl"
							data-still={live ? undefined : ""}
						>
							<span className="npx-label">
								<Cover sizes="200px" track={track} />
							</span>
						</span>
						<span className="npx-sleeve">
							<Cover sizes="(min-width: 768px) 60vh, 80vw" track={track} />
						</span>
					</div>
					<div className="npx-side" data-npx-side="">
						<p className="np-when">
							<Bars on={live} />
							{heard}
							{!live && ago ? ` · ${ago}` : null}
						</p>
						<p className="npx-title">{track.title}</p>
						<p className="npx-by">
							{track.artists} · {track.album}
						</p>
						{live ? (
							<Progress
								className="np-time npx-time"
								duration={duration}
								elapsed={elapsed}
							/>
						) : null}
						<div className="npx-actions">
							{preview ? (
								<button
									aria-pressed={clipping}
									className="film-more"
									data-sfx="silent"
									onClick={playBit}
									type="button"
								>
									{clipping ? "stop" : "play a bit"}
								</button>
							) : null}
							<ExternalLink
								className="npx-link"
								data-cursor="nav"
								href={track.url}
							>
								open in spotify
							</ExternalLink>
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

/** the fuller one, at the end of the home: the month's five most played,
    as a crate of records, each with a bit of itself to play */
export function SpotifyPanel() {
	const status = useStatus();
	const top = status?.top ?? [];
	const shown = top.length > 0;
	/* four in the crate, two by two */
	const crate = top.slice(0, CRATE);

	/* the panel arrives after the strip was measured */
	useEffect(() => {
		if (shown) {
			ScrollTrigger.refresh();
		}
	}, [shown]);

	/* a clip doesn't follow you to another page */
	useEffect(() => stopClip, []);

	if (!shown) {
		return null;
	}
	return (
		<section aria-labelledby="speakers" className="panel ab-spin">
			<div className="rec-head">
				<p className="page-label">on rotation</p>
				<h2 className="rec-heading" id="speakers">
					most played, <em>the last four weeks</em>
				</h2>
				<p className="rec-note">
					what's been on while i build, straight from spotify. press a record to
					hear a bit of it; a song's name opens it there.
				</p>
			</div>
			{/* one column, standing on the same floor as the heading: what's on
			    now (or was last), then the four most played */}
			<div className="rec-main">
				{status?.track ? (
					<div className="rec-block">
						<p className="rec-tag">
							{status.isPlaying ? "now playing" : "last played"}
						</p>
						<NowPlaying status={status} track={status.track} />
					</div>
				) : null}
				<div className="rec-block">
					<p className="rec-tag">top four</p>
					<ol className="rec-crate">
						{crate.map((item, position) => (
							<Record
								key={`${item.url}-${item.title}`}
								position={position}
								track={item}
							/>
						))}
					</ol>
				</div>
			</div>
		</section>
	);
}
