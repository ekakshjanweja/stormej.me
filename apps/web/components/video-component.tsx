import type React from "react";

interface YouTubeVideoProps {
	allowFullScreen?: boolean;
	autoPlay?: boolean;
	className?: string;
	controls?: boolean;
	height?: number | string;
	muted?: boolean;
	startAt?: number;
	title?: string;
	videoId: string;
	width?: number | string;
}

export const YouTubeVideo: React.FC<YouTubeVideoProps> = ({
	videoId,
	title = "YouTube video",
	autoPlay = false,
	startAt = 0,
	muted = false,
	controls = true,
	className = "",
	height = "100%",
	allowFullScreen = true,
}) => {
	const params = new URLSearchParams({
		autoplay: autoPlay ? "1" : "0",
		controls: controls ? "1" : "0",
		mute: muted ? "1" : "0",
		rel: "0",
		start: startAt.toString(),
	});

	const embedUrl = `https://www.youtube.com/embed/${videoId}?${params.toString()}`;

	return (
		<div
			className={`relative w-full pb-[56.25%] ${className}`}
			style={{
				paddingBottom:
					typeof height === "string" && height !== "100%" ? height : "56.25%",
			}}
		>
			<iframe
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowFullScreen={allowFullScreen}
				className="absolute top-0 left-0 h-full w-full"
				loading="lazy"
				src={embedUrl}
				title={title}
			/>
		</div>
	);
};
