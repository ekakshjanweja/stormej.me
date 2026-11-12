"use client";

import { Activity, type ReactNode, useSyncExternalStore } from "react";
import { DESKTOP } from "@/lib/desktop";
import { SITE } from "@/lib/profile";
import "./desktop-only.css";

const useMatches = (query: string) =>
	useSyncExternalStore(
		(onChange) => {
			const media = window.matchMedia(query);
			media.addEventListener("change", onChange);
			return () => media.removeEventListener("change", onChange);
		},
		() => window.matchMedia(query).matches,
		/* the server can't see the screen: it renders the experiment, and the
		   css hides it on anything else until this takes over */
		() => true
	);

/** the lab's index, only on a desktop. anywhere else (a phone, a tablet,
    a window too small) it isn't mounted at all: a note says why and points at the portfolio. the
    css makes the same call before the page hydrates, so nothing flashes,
    and a window resized past the line swaps between the two */
export function DesktopOnly({ children }: { children: ReactNode }) {
	const fits = useMatches(DESKTOP);

	return (
		<div className="desktop-only">
			<div className="desktop-only-gate">
				<div className="desktop-only-note">
					<p className="desktop-only-mark">ekaksh janweja · lab</p>
					<h1 className="desktop-only-title">
						made for a <em>desktop</em>
					</h1>
					{/* css shows the reason that fits the screen */}
					<p className="desktop-only-why" data-why="touch">
						the experiments here run sideways, on a wide screen with a mouse or
						trackpad, so they only open on a desktop. the portfolio has
						everything in them, and works anywhere.
					</p>
					<p className="desktop-only-why" data-why="window">
						the experiments here need a window at least 1200 by 600 to run
						sideways. make this one bigger and it opens, or see the portfolio
						meanwhile.
					</p>
					<a className="desktop-only-link" href={SITE}>
						see the portfolio <span aria-hidden="true">→</span>
					</a>
				</div>
			</div>
			<div className="desktop-only-content">
				<Activity mode={fits ? "visible" : "hidden"}>{children}</Activity>
			</div>
		</div>
	);
}
