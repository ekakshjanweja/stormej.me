"use client";

import Image from "next/image";
import { createContext, useContext } from "react";
import {
	playedAgo,
	type SpotifyStatus,
	type SpotifyTrack,
	useSpotify,
} from "@/lib/use-spotify";
import { pad } from "../_lib/format";

/* what's playing, as a small thing in orbit: a chip in the header on every
   page and a fuller block on about. one poll per page, shared through
   context. nothing renders until spotify answers, or if it isn't set up */

const RadioContext = createContext<SpotifyStatus | null>(null);

export function RadioProvider({ children }: { children: React.ReactNode }) {
	const status = useSpotify();
	return <RadioContext value={status}>{children}</RadioContext>;
}

function Bars() {
	return (
		<span aria-hidden="true" className="radio-bars">
			<i />
			<i />
			<i />
		</span>
	);
}

function Cover({ size, track }: { size: number; track: SpotifyTrack }) {
	if (!track.albumArt) {
		return (
			<span aria-hidden="true" className="radio-cover radio-cover-empty" />
		);
	}
	return (
		<Image
			alt={`${track.album} cover`}
			className="radio-cover"
			height={size}
			sizes={`${size}px`}
			src={track.albumArt}
			width={size}
		/>
	);
}

const stateOf = (status: SpotifyStatus) => {
	if (status.isPlaying) {
		return "now playing";
	}
	return status.playedAt
		? `last played · ${playedAgo(status.playedAt)}`
		: "last played";
};

/** the compact one, for the header */
export function RadioChip() {
	const status = useContext(RadioContext);
	if (!status?.track) {
		return null;
	}
	const { track } = status;
	return (
		<a
			className="radio-chip"
			data-cursor="listen"
			data-playing={status.isPlaying || undefined}
			href={track.url}
			rel="noopener noreferrer"
			target="_blank"
		>
			<Cover size={30} track={track} />
			<span className="radio-text">
				<span className="radio-state">
					{status.isPlaying ? <Bars /> : null}
					{stateOf(status)}
				</span>
				<span className="radio-line">
					{track.title} <span className="radio-artist">· {track.artists}</span>
				</span>
			</span>
			<span className="sr-only"> (opens in a new tab)</span>
		</a>
	);
}

/** the full one, for about: what's on now and what's been on repeat */
export function RadioBlock() {
	const status = useContext(RadioContext);
	if (!status?.track) {
		return null;
	}
	const { top, track } = status;
	return (
		<section aria-labelledby="radio-title" className="radio-block">
			<div className="section-head">
				<h2 className="kicker" id="radio-title">
					in orbit
				</h2>
				<p className="section-note">from spotify, as it happens</p>
			</div>
			<a
				className="radio-now"
				data-cursor="listen"
				data-playing={status.isPlaying || undefined}
				href={track.url}
				rel="noopener noreferrer"
				target="_blank"
			>
				<Cover size={132} track={track} />
				<span className="radio-now-text">
					<span className="radio-state">
						{status.isPlaying ? <Bars /> : null}
						{stateOf(status)}
					</span>
					<span className="radio-now-title">{track.title}</span>
					<span className="radio-now-artist">
						{track.artists} · {track.album}
					</span>
				</span>
				<span className="sr-only"> (opens in a new tab)</span>
			</a>
			{top.length > 0 ? (
				<>
					<h3 className="kicker radio-top-title">
						on repeat · last four weeks
					</h3>
					<ol className="radio-top">
						{top.map((item, place) => (
							<li key={`${item.url}-${item.title}`}>
								<a href={item.url} rel="noopener noreferrer" target="_blank">
									<span aria-hidden="true" className="radio-rank">
										{pad(place + 1)}
									</span>
									<Cover size={44} track={item} />
									<span className="radio-top-text">
										<span className="radio-top-name">{item.title}</span>
										<span className="radio-top-artist">{item.artists}</span>
									</span>
									<span aria-hidden="true" className="radio-out">
										↗
									</span>
									<span className="sr-only"> (opens in a new tab)</span>
								</a>
							</li>
						))}
					</ol>
				</>
			) : null}
		</section>
	);
}
