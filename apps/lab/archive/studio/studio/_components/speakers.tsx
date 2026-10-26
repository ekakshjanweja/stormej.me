"use client";

import Image from "next/image";
import {
	playedAgo,
	type SpotifyStatus,
	type SpotifyTrack,
	useSpotify,
} from "@/lib/use-spotify";
import { ExternalLink } from "./external-link";

/* "on the studio speakers": what's playing on his spotify, or what played
   last. nothing at all when spotify isn't set up. the bars only move while
   something is actually playing, and stand still with reduced motion */

function Bars() {
	return (
		<span aria-hidden="true" className="eq">
			<span />
			<span />
			<span />
			<span />
		</span>
	);
}

function Cover({ size, track }: { size: number; track: SpotifyTrack }) {
	return (
		<span className="speakers-cover">
			{track.albumArt ? (
				<Image
					alt={`${track.album} cover`}
					height={size}
					src={track.albumArt}
					width={size}
				/>
			) : null}
		</span>
	);
}

function Status({ status }: { status: SpotifyStatus }) {
	if (status.isPlaying) {
		return (
			<>
				<Bars />
				now playing
			</>
		);
	}
	return (
		<>last played{status.playedAt ? ` · ${playedAgo(status.playedAt)}` : ""}</>
	);
}

/** the strip at the top of the footer, on every page */
export function SpeakersMini() {
	const status = useSpotify();
	const track = status?.track;
	if (!(status && track)) {
		return null;
	}
	return (
		<section aria-label="on the studio speakers" className="speakers">
			<Cover size={88} track={track} />
			<div className="speakers-body">
				<p className="speakers-status">
					<span>on the studio speakers</span>
					<span aria-hidden="true">·</span>
					<Status status={status} />
				</p>
				<p className="speakers-track">
					<ExternalLink href={track.url}>{track.title}</ExternalLink>{" "}
					<span className="speakers-artists">— {track.artists}</span>
				</p>
			</div>
		</section>
	);
}

/** the bigger block on the about page, with the month's most played */
export function SpeakersFull() {
	const status = useSpotify();
	const track = status?.track;
	if (!(status && track)) {
		return null;
	}
	return (
		<section aria-labelledby="speakers-title" className="speakers-full">
			<div className="speakers-full-now">
				<h2 className="about-label" id="speakers-title">
					on the studio speakers
				</h2>
				<div className="speakers-full-track">
					<Cover size={240} track={track} />
					<div>
						<p className="speakers-status">
							<Status status={status} />
						</p>
						<p className="speakers-full-title">
							<ExternalLink href={track.url}>{track.title}</ExternalLink>
						</p>
						<p className="speakers-artists">{track.artists}</p>
					</div>
				</div>
			</div>
			{status.top.length > 0 ? (
				<div className="speakers-full-top">
					<h3 className="about-label">most played, last four weeks</h3>
					<ol className="speakers-top">
						{status.top.map((item, index) => (
							<li key={item.url + item.title}>
								<span aria-hidden="true" className="speakers-top-index">
									{String(index + 1).padStart(2, "0")}
								</span>
								<Cover size={88} track={item} />
								<span className="speakers-top-text">
									<ExternalLink href={item.url}>{item.title}</ExternalLink>
									<span className="speakers-artists">{item.artists}</span>
								</span>
							</li>
						))}
					</ol>
				</div>
			) : null}
		</section>
	);
}
