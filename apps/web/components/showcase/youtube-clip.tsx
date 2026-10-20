"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** youtube shows its title over the first seconds of playback; the thumbnail
 *  stays on top this long after the video actually starts */
const REVEAL_DELAY_MS = 2500;
const IN_VIEW = 0.35;
/** youtube swaps to a cramped player with controls when an embed is small,
 *  so the player renders at full size and is scaled down to cover the card */
const PLAYER = { height: 720, width: 1280 } as const;
/** a touch past cover, so the player's edges stay outside the frame */
const CROP = 1.08;
const YOUTUBE_ORIGIN = "https://www.youtube-nocookie.com";
/** IFrame API player state for "playing" */
const PLAYING = 1;

/** the player's postMessage payloads: we only need the state change */
function isPlayingMessage(data: unknown) {
	if (typeof data !== "string") {
		return false;
	}
	try {
		const parsed = JSON.parse(data) as {
			event?: string;
			info?: { playerState?: number } | number;
		};
		if (parsed.event === "onStateChange") {
			return parsed.info === PLAYING;
		}
		return (
			parsed.event === "infoDelivery" &&
			typeof parsed.info === "object" &&
			parsed.info?.playerState === PLAYING
		);
	} catch {
		return false;
	}
}

function embedUrl(id: string, start: number) {
	const params = new URLSearchParams({
		autoplay: "1",
		controls: "0",
		disablekb: "1",
		enablejsapi: "1",
		iv_load_policy: "3",
		loop: "1",
		modestbranding: "1",
		mute: "1",
		playlist: id,
		playsinline: "1",
		rel: "0",
		start: String(start),
	});
	return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

/**
 * A YouTube video playing muted and looped inside a card, the same way an mp4
 * would. The player only exists while the card is on screen (it is torn down
 * when it scrolls away), the thumbnail covers the start-up, and reduced
 * motion keeps it a still.
 */
export function YouTubeClip({
	id,
	start = 0,
	title,
}: {
	id: string;
	start?: number;
	title: string;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const frame = useRef<HTMLIFrameElement>(null);
	const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
	const [inView, setInView] = useState(false);
	const [scale, setScale] = useState(1);
	const [playing, setPlaying] = useState(false);
	const [thumb, setThumb] = useState(
		`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`
	);

	useEffect(() => {
		const node = ref.current;
		if (!node) {
			return;
		}
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			return;
		}
		const observer = new IntersectionObserver(
			([entry]) => {
				const visible = Boolean(entry?.isIntersecting);
				setInView(visible);
				if (!visible) {
					setPlaying(false);
				}
			},
			{ threshold: IN_VIEW }
		);
		observer.observe(node);
		const sizer = new ResizeObserver(([entry]) => {
			if (!entry) {
				return;
			}
			const { width, height } = entry.contentRect;
			setScale(Math.max(width / PLAYER.width, height / PLAYER.height) * CROP);
		});
		sizer.observe(node);
		return () => {
			observer.disconnect();
			sizer.disconnect();
			clearTimeout(timer.current);
		};
	}, []);

	// only uncover the player once youtube reports it is really playing; if
	// autoplay is refused the thumbnail simply stays
	useEffect(() => {
		if (!inView) {
			return;
		}
		const onMessage = (event: MessageEvent) => {
			if (event.source !== frame.current?.contentWindow) {
				return;
			}
			if (isPlayingMessage(event.data) && timer.current === undefined) {
				timer.current = setTimeout(() => setPlaying(true), REVEAL_DELAY_MS);
			}
		};
		window.addEventListener("message", onMessage);
		return () => {
			window.removeEventListener("message", onMessage);
			clearTimeout(timer.current);
			timer.current = undefined;
		};
	}, [inView]);

	// subscribe to the player's state changes
	const onLoad = useCallback(() => {
		frame.current?.contentWindow?.postMessage(
			JSON.stringify({ channel: "widget", event: "listening", id }),
			YOUTUBE_ORIGIN
		);
	}, [id]);

	// not every upload has a max-res still
	const onThumbError = useCallback(
		() => setThumb(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`),
		[id]
	);

	return (
		<div className="absolute inset-0 overflow-hidden bg-black" ref={ref}>
			{inView ? (
				<iframe
					allow="autoplay; encrypted-media; picture-in-picture"
					aria-hidden
					className="youtube-clip"
					height={PLAYER.height}
					onLoad={onLoad}
					ref={frame}
					src={embedUrl(id, start)}
					style={{ transform: `translate(-50%, -50%) scale(${scale})` }}
					tabIndex={-1}
					title={`${title} demo`}
					width={PLAYER.width}
				/>
			) : null}
			<Image
				alt={`${title} demo`}
				className={cn(
					"showcase-fill object-cover transition-opacity duration-500",
					playing && "opacity-0"
				)}
				fill
				onError={onThumbError}
				sizes="(min-width: 1024px) 640px, 92vw"
				src={thumb}
				unoptimized
			/>
		</div>
	);
}
