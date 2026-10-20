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
				className="group flex items-baseline justify-between gap-4 rounded py-3.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
				href={videoHref(video.id)}
				onClick={onClick}
				rel="noopener noreferrer"
				target="_blank"
			>
				<span className="link-underline-hover font-medium text-[14px] text-foreground leading-snug">
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
