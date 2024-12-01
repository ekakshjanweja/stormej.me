import { SpotifyCurrentPlayingResponse } from "@/lib/spotify";

interface SpotifyCurrentPlayingBadgeProps {
  title?: string | undefined;
  spotifyInfo: SpotifyCurrentPlayingResponse;
}

export default function SpotifyCurrentPlayingBadge({
  title,
  spotifyInfo,
}: SpotifyCurrentPlayingBadgeProps) {
  const musicName = spotifyInfo?.item?.name ?? "Not playing";
  const mainArtist = spotifyInfo?.item?.artists?.[0]?.name ?? "Unknown Artist";
  const musicLink = spotifyInfo?.item?.external_urls?.spotify ?? "#";

  return (
    <div className="flex flex-col gap-1 w-full">
      {title && (
        <p className="font-mono text-sm text-gray-400 opacity-65">{title}</p>
      )}
      <a href={musicLink}>
        {musicName} - {mainArtist}
      </a>
    </div>
  );
}
