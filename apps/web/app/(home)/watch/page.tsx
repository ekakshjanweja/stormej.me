import type { Metadata } from "next";
import Link from "next/link";
import { listVideos, YOUTUBE_PLAYLIST } from "@/lib/videos";
import { VideoListItem } from "../_components/video-list-item";

const description = "sessions, bootcamps, and flutter deep-dives";

export const metadata: Metadata = {
	alternates: { canonical: "/watch" },
	description,
	openGraph: {
		description,
		title: "watch | stormej",
		type: "website",
		url: "https://www.stormej.me/watch",
	},
	title: "watch",
	twitter: {
		description,
		title: "watch | stormej",
	},
};

export default function Watch() {
	const videos = listVideos();

	return (
		<main>
			<div className="sticky top-16 z-20 -mx-2 mb-8 bg-background/85 px-2 py-3 backdrop-blur-md">
				<div className="flex items-baseline justify-between gap-4">
					<h1 className="section-label">watch</h1>
					<Link
						className="meta-tag hover-dim rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
						href={YOUTUBE_PLAYLIST}
						rel="noopener noreferrer"
						target="_blank"
					>
						playlist
					</Link>
				</div>
			</div>
			<p className="mb-8 text-pretty font-light text-[13px] text-muted-foreground leading-[1.6]">
				{description}
			</p>
			<ul className="flex flex-col gap-5">
				{videos.map((video) => (
					<li key={video.id}>
						<VideoListItem video={video} />
					</li>
				))}
			</ul>
		</main>
	);
}
