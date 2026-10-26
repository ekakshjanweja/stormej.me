"use client";

import { useEffect, useState } from "react";
import { withBase } from "./base";
import type { SpotifyStatus } from "./spotify";

export type { SpotifyStatus, SpotifyTrack } from "./spotify";

const POLL_MS = 30_000;

const ENDPOINT = withBase("/api/spotify");

/* add ?spotify=demo to any page in dev to see the player with fake data */
const wantsDemo = () =>
	process.env.NODE_ENV === "development" &&
	window.location.search.includes("spotify=demo");

const demo = (): SpotifyStatus => {
	const track = (title: string, cover: string) => ({
		album: "demo album",
		albumArt: withBase(`/media/ig/${cover}.webp`),
		artists: "demo artist",
		preview: null,
		title,
		url: "https://open.spotify.com",
	});
	return {
		configured: true,
		durationMs: 214_000,
		fetchedAt: Date.now(),
		isPlaying: true,
		playedAt: null,
		progressMs: 81_000,
		top: [
			track("first demo track", "De695u9iGL5"),
			track("second demo track", "DewVeY2ixQP"),
			track("third demo track", "DerCwzLCNFR"),
			track("fourth demo track", "DejyibXiKjs"),
		],
		track: track("a demo track with a longer title", "DeXN1v_zjYM"),
	};
};

/** what's playing, refreshed every 30s while the tab is visible. null until
 *  the first answer, and stays null if spotify isn't set up */
export const useSpotify = () => {
	const [status, setStatus] = useState<SpotifyStatus | null>(null);

	useEffect(() => {
		let alive = true;
		const load = async () => {
			if (document.visibilityState !== "visible") {
				return;
			}
			if (wantsDemo()) {
				setStatus(demo());
				return;
			}
			try {
				const response = await fetch(ENDPOINT);
				if (!response.ok) {
					return;
				}
				const next = (await response.json()) as SpotifyStatus;
				if (alive) {
					setStatus(next.configured && next.track ? next : null);
				}
			} catch {
				/* offline or blocked; keep whatever we had */
			}
		};
		load();
		const timer = window.setInterval(load, POLL_MS);
		document.addEventListener("visibilitychange", load);
		return () => {
			alive = false;
			window.clearInterval(timer);
			document.removeEventListener("visibilitychange", load);
		};
	}, []);

	return status;
};

/** "2026-10-26T04:12:00Z" → "2h ago" */
export const playedAgo = (iso: string, now = Date.now()) => {
	const minutes = Math.max(1, Math.round((now - Date.parse(iso)) / 60_000));
	if (minutes < 60) {
		return `${minutes}m ago`;
	}
	const hours = Math.round(minutes / 60);
	if (hours < 24) {
		return `${hours}h ago`;
	}
	return `${Math.round(hours / 24)}d ago`;
};
