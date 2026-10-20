"use client";

import {
	Maximize,
	Minimize,
	Pause,
	Play,
	RotateCcw,
	Volume2,
	VolumeX,
} from "lucide-react";
import {
	type ChangeEvent,
	type CSSProperties,
	type KeyboardEvent,
	type SyntheticEvent,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { cn } from "@/lib/utils";

/** controls fade out after this long without the pointer moving */
const IDLE_MS = 2200;
/** arrow keys jump this far */
const SEEK_STEP = 5;
const IN_VIEW = 0.4;

function formatTime(seconds: number) {
	if (!Number.isFinite(seconds) || seconds < 0) {
		return "0:00";
	}
	const m = Math.floor(seconds / 60);
	const s = Math.floor(seconds % 60);
	return `${m}:${String(s).padStart(2, "0")}`;
}

const iconButton =
	"inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/15 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60";

/** the preview's one call to action: restart with sound */
function PreviewOverlay({
	portrait,
	duration,
	onWatch,
}: {
	portrait: boolean;
	duration: number;
	onWatch: () => void;
}) {
	return (
		<div
			className={cn(
				"pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-black/45 via-transparent to-transparent",
				// a tall frame can be narrow: a short label, centred
				portrait ? "justify-center p-3" : "justify-start p-4 sm:p-5"
			)}
		>
			<button
				aria-label="watch with sound"
				className="pointer-events-auto inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-white/95 px-4 py-2 font-medium text-[13px] text-black shadow-[0_8px_24px_-8px_rgb(0_0_0/0.5)] transition-transform duration-150 hover:scale-[1.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 active:scale-[0.98] motion-reduce:transition-none"
				onClick={onWatch}
				type="button"
			>
				<Play aria-hidden className="h-3.5 w-3.5 fill-current" />
				{portrait ? "watch" : "watch with sound"}
				{!portrait && duration > 0 && (
					<span className="text-black/50 tabular-nums">
						· {formatTime(duration)}
					</span>
				)}
			</button>
		</div>
	);
}

/** play, time, scrubber, mute and full screen, shown while watching */
function ControlBar({
	portrait,
	visible,
	playing,
	muted,
	fullscreen,
	time,
	duration,
	onToggle,
	onToggleMute,
	onToggleFullscreen,
	onScrub,
}: {
	portrait: boolean;
	visible: boolean;
	playing: boolean;
	muted: boolean;
	fullscreen: boolean;
	time: number;
	duration: number;
	onToggle: () => void;
	onToggleMute: () => void;
	onToggleFullscreen: () => void;
	onScrub: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
	const progress = duration > 0 ? (time / duration) * 100 : 0;
	return (
		<div
			className={cn(
				"absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-3 pt-10 pb-3 transition-opacity duration-300 sm:gap-3 sm:px-4",
				visible ? "opacity-100" : "pointer-events-none opacity-0"
			)}
		>
			<button
				aria-label={playing ? "pause" : "play"}
				className={iconButton}
				onClick={onToggle}
				type="button"
			>
				{playing ? (
					<Pause aria-hidden className="h-4 w-4 fill-current" />
				) : (
					<Play aria-hidden className="h-4 w-4 fill-current" />
				)}
			</button>
			<span
				className={cn(
					"shrink-0 font-mono text-[11px] text-white/80 tabular-nums",
					!portrait && "w-[3.75rem]"
				)}
			>
				{formatTime(time)}
			</span>
			<input
				aria-label="seek"
				aria-valuetext={`${formatTime(time)} of ${formatTime(duration)}`}
				className="video-scrubber min-w-0 flex-1"
				max={duration || 0}
				min={0}
				onChange={onScrub}
				step={0.1}
				style={{ "--progress": `${progress}%` } as CSSProperties}
				type="range"
				value={time}
			/>
			{/* a tall frame is too narrow for both times and a usable scrubber */}
			{!portrait && (
				<span className="w-[3.75rem] shrink-0 text-right font-mono text-[11px] text-white/60 tabular-nums">
					{formatTime(duration)}
				</span>
			)}
			<button
				aria-label={muted ? "unmute" : "mute"}
				className={iconButton}
				onClick={onToggleMute}
				type="button"
			>
				{muted ? (
					<VolumeX aria-hidden className="h-4 w-4" />
				) : (
					<Volume2 aria-hidden className="h-4 w-4" />
				)}
			</button>
			<button
				aria-label={fullscreen ? "exit full screen" : "full screen"}
				className={iconButton}
				onClick={onToggleFullscreen}
				type="button"
			>
				{fullscreen ? (
					<Minimize aria-hidden className="h-4 w-4" />
				) : (
					<Maximize aria-hidden className="h-4 w-4" />
				)}
			</button>
		</div>
	);
}

/**
 * A project demo, presented like a product film rather than a bare <video>.
 *
 * It starts as a muted loop while on screen, so the page moves without
 * asking anything of the reader, with one clear "watch with sound" button.
 * That restarts it from the top with sound and quiet controls (play, time,
 * scrubber, mute, fullscreen) that fade while it plays. Keyboard: space or k
 * plays/pauses, m mutes, f goes fullscreen, arrows seek. Reduced motion skips
 * the preview loop and waits on the poster.
 */
export function VideoPlayer({
	src,
	poster,
	title,
	portrait = false,
}: {
	src: string;
	poster?: string;
	title: string;
	/** a phone recording: a tall frame, sized to fit on screen */
	portrait?: boolean;
}) {
	const frame = useRef<HTMLElement>(null);
	const video = useRef<HTMLVideoElement>(null);
	const idleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

	/** preview: the muted loop; watching: the real playback with sound */
	const [mode, setMode] = useState<"preview" | "watching">("preview");
	const [playing, setPlaying] = useState(false);
	const [muted, setMuted] = useState(true);
	const [ended, setEnded] = useState(false);
	const [time, setTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [idle, setIdle] = useState(false);
	const [fullscreen, setFullscreen] = useState(false);

	// the preview loop only runs while the player is on screen
	useEffect(() => {
		const node = frame.current;
		const el = video.current;
		if (!(node && el) || mode !== "preview") {
			return;
		}
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			return;
		}
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry?.isIntersecting) {
					// browsers only autoplay silently
					el.muted = true;
					el.play().catch(() => {
						// autoplay refused: the poster and its button stay up
					});
				} else {
					el.pause();
				}
			},
			{ threshold: IN_VIEW }
		);
		observer.observe(node);
		return () => observer.disconnect();
	}, [mode]);

	// the metadata can land before hydration attaches onLoadedMetadata
	useEffect(() => {
		const el = video.current;
		if (el && el.readyState >= 1) {
			setDuration(el.duration);
		}
	}, []);

	useEffect(() => {
		const onChange = () =>
			setFullscreen(document.fullscreenElement === frame.current);
		document.addEventListener("fullscreenchange", onChange);
		return () => {
			document.removeEventListener("fullscreenchange", onChange);
			clearTimeout(idleTimer.current);
		};
	}, []);

	const wake = useCallback(() => {
		setIdle(false);
		clearTimeout(idleTimer.current);
		idleTimer.current = setTimeout(() => setIdle(true), IDLE_MS);
	}, []);

	const watch = useCallback(() => {
		const el = video.current;
		if (!el) {
			return;
		}
		el.currentTime = 0;
		el.muted = false;
		el.loop = false;
		setMuted(false);
		setEnded(false);
		setMode("watching");
		el.play().catch(() => {
			// a blocked play leaves the controls showing a play button
		});
		wake();
	}, [wake]);

	const toggle = useCallback(() => {
		const el = video.current;
		if (!el) {
			return;
		}
		if (mode === "preview") {
			watch();
			return;
		}
		if (el.paused || el.ended) {
			if (el.ended) {
				el.currentTime = 0;
			}
			setEnded(false);
			el.play().catch(() => {
				// stays paused
			});
		} else {
			el.pause();
		}
		wake();
	}, [mode, wake, watch]);

	const toggleMute = useCallback(() => {
		const el = video.current;
		if (!el) {
			return;
		}
		el.muted = !el.muted;
		setMuted(el.muted);
		wake();
	}, [wake]);

	const toggleFullscreen = useCallback(() => {
		const node = frame.current;
		if (!node) {
			return;
		}
		if (document.fullscreenElement) {
			document.exitFullscreen().catch(() => {
				// already out
			});
		} else {
			node.requestFullscreen().catch(() => {
				// not allowed here (iframes, some mobile browsers)
			});
		}
	}, []);

	const seek = useCallback(
		(to: number) => {
			const el = video.current;
			if (!el) {
				return;
			}
			el.currentTime = Math.min(Math.max(to, 0), el.duration || 0);
			setTime(el.currentTime);
			wake();
		},
		[wake]
	);

	const onScrub = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => seek(Number(event.target.value)),
		[seek]
	);

	const onKeyDown = useCallback(
		(event: KeyboardEvent<HTMLElement>) => {
			// let the scrubber keep its own arrow keys
			if (event.target instanceof HTMLInputElement) {
				return;
			}
			const actions: Record<string, () => void> = {
				" ": toggle,
				ArrowLeft: () => seek(time - SEEK_STEP),
				ArrowRight: () => seek(time + SEEK_STEP),
				f: toggleFullscreen,
				k: toggle,
				m: toggleMute,
			};
			const action = actions[event.key];
			if (action && mode === "watching") {
				event.preventDefault();
				action();
			} else if (
				mode === "preview" &&
				(event.key === " " || event.key === "k")
			) {
				event.preventDefault();
				watch();
			}
		},
		[mode, seek, time, toggle, toggleFullscreen, toggleMute, watch]
	);

	const onEnded = useCallback(() => {
		setEnded(true);
		setPlaying(false);
	}, []);
	const onLoadedMetadata = useCallback(
		(event: SyntheticEvent<HTMLVideoElement>) =>
			setDuration(event.currentTarget.duration),
		[]
	);
	const onPause = useCallback(() => setPlaying(false), []);
	const onPlay = useCallback(() => setPlaying(true), []);
	const onTimeUpdate = useCallback(
		(event: SyntheticEvent<HTMLVideoElement>) =>
			setTime(event.currentTarget.currentTime),
		[]
	);

	const showControls = mode === "watching" && (!(playing && idle) || ended);

	return (
		// biome-ignore lint/a11y/noNoninteractiveElementInteractions: a media player frame takes keyboard shortcuts and wakes its controls on pointer movement, like a native player
		<figure
			aria-label={`${title} demo video`}
			className={cn(
				"video-player group relative isolate overflow-hidden rounded-xl border border-border/60 bg-black focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-4 focus-visible:ring-offset-background",
				// a tall film sizes by height on desktop: whatever the pinned panel
				// has left under the overview, so the panel never has to scroll
				portrait
					? "mx-auto aspect-[9/16] w-full max-w-[17.5rem] lg:h-[clamp(12rem,calc(100svh-33rem),30rem)] lg:w-auto lg:max-w-none"
					: "aspect-video",
				mode === "watching" && idle && playing && "cursor-none"
			)}
			onKeyDown={onKeyDown}
			onPointerMove={mode === "watching" ? wake : undefined}
			ref={frame}
			// biome-ignore lint/a11y/noNoninteractiveTabindex: the frame takes keyboard shortcuts like a native player
			tabIndex={0}
		>
			<video
				className={cn(
					"h-full w-full cursor-pointer",
					// full screen and tall films letterbox instead of cropping
					portrait || fullscreen ? "object-contain" : "object-cover"
				)}
				loop={mode === "preview"}
				muted={muted}
				onClick={toggle}
				onDurationChange={onLoadedMetadata}
				onEnded={onEnded}
				onLoadedMetadata={onLoadedMetadata}
				onPause={onPause}
				onPlay={onPlay}
				onTimeUpdate={onTimeUpdate}
				playsInline
				poster={poster}
				preload="metadata"
				ref={video}
				src={src}
			/>

			{mode === "preview" && (
				<PreviewOverlay
					duration={duration}
					onWatch={watch}
					portrait={portrait}
				/>
			)}

			{mode === "watching" && ended && (
				<div className="absolute inset-0 flex items-center justify-center bg-black/40">
					<button
						className="inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 font-medium text-[13px] text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
						onClick={toggle}
						type="button"
					>
						<RotateCcw aria-hidden className="h-3.5 w-3.5" />
						watch again
					</button>
				</div>
			)}

			{mode === "watching" && (
				<ControlBar
					duration={duration}
					fullscreen={fullscreen}
					muted={muted}
					onScrub={onScrub}
					onToggle={toggle}
					onToggleFullscreen={toggleFullscreen}
					onToggleMute={toggleMute}
					playing={playing}
					portrait={portrait}
					time={time}
					visible={showControls}
				/>
			)}
		</figure>
	);
}
