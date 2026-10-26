"use client";

import { useEffect, useState } from "react";
import { withBase } from "./base";
import type { SpotifyStatus } from "./spotify";

export type { SpotifyStatus, SpotifyTrack } from "./spotify";

const POLL_MS = 30_000;

/* add ?spotify=demo to any page in dev to see the player with fake data */
const endpoint = () =>
	withBase(
		window.location.search.includes("spotify=demo")
			? "/api/spotify?demo=1"
			: "/api/spotify"
	);

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
			try {
				const response = await fetch(endpoint());
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
