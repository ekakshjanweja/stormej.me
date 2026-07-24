import React from "react";

interface YouTubeVideoProps {
  videoId: string;
  title?: string;
  autoPlay?: boolean;
  startAt?: number;
  muted?: boolean;
  controls?: boolean;
  className?: string;
  width?: number | string;
  height?: number | string;
  allowFullScreen?: boolean;
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
    mute: muted ? "1" : "0",
    controls: controls ? "1" : "0",
    start: startAt.toString(),
    rel: "0",
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
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen={allowFullScreen}
        className="absolute top-0 left-0 w-full h-full"
        loading="lazy"
      />
    </div>
  );
};
