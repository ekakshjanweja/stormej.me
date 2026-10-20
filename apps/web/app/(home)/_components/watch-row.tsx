"use client";

import Link from "next/link";
import { track } from "@/lib/analytics";
import { HOME_VIDEOS_LIMIT, listVideos } from "@/lib/videos";
import { VideoListItem } from "./video-list-item";

const trackViewMore = () =>
	track("nav_link_clicked", {
		href: "/watch",
		label: "view more",
		surface: "home_watch",
	});

export const WatchRow = () => {
	const videos = listVideos();

	return (
		<section data-cursor-anchor="watch">
			<div className="mb-3 flex items-baseline justify-between">
				<h2 className="section-label">watch</h2>
				{videos.length > HOME_VIDEOS_LIMIT && (
					<Link
						className="meta-tag hover-dim rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
						href="/watch"
						onClick={trackViewMore}
					>
						view more
					</Link>
				)}
			</div>
			<ul className="divide-y divide-border/60 border-border/60 border-y">
				{videos.slice(0, HOME_VIDEOS_LIMIT).map((video) => (
					<li key={video.id}>
						<VideoListItem video={video} />
					</li>
				))}
			</ul>
		</section>
	);
};
