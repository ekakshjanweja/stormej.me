"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useCallback } from "react";
import { YoutubePreview } from "@/components/youtube-preview";
import { track } from "@/lib/analytics";
import type { Video } from "@/lib/videos";
import { formatVideoDuration, videoHref } from "@/lib/videos";

export function VideoListItem({ video }: { video: Video }) {
	const onClick = useCallback(
		() =>
			track("content_card_clicked", {
				external: true,
				kind: "youtube",
				slug: video.id,
				title: video.title,
			}),
		[video.id, video.title]
	);

	return (
		<YoutubePreview title={video.title} videoId={video.id}>
			<Link
				className="group flex flex-col gap-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
				href={videoHref(video.id)}
				onClick={onClick}
				rel="noopener noreferrer"
				target="_blank"
			>
				<span className="squiggle-link-hover font-medium text-[14px] text-foreground sm:truncate">
					{video.title}
				</span>
				<span className="flex shrink-0 items-center gap-2">
					<span className="meta-tag whitespace-nowrap">
						{formatVideoDuration(video.durationSeconds)}
					</span>
					<ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
				</span>
			</Link>
		</YoutubePreview>
	);
}
