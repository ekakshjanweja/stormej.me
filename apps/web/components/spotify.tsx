import { useEffect, useState } from "react";
import Image from "next/image";

interface SpotifyTrack {
  name: string;
  artist: string;
  albumArt: string;
  songUrl: string;
}

const SpotifyNowPlaying = () => {
  const [track, setTrack] = useState<SpotifyTrack | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNowPlaying = async () => {
      try {
        const response = await fetch("/api/spotify");
        const data = await response.json();

        if (data && data.isPlaying) {
          setTrack({
            name: data.title,
            artist: data.artist,
            albumArt: data.albumImageUrl,
            songUrl: data.songUrl,
          });
        }
      } catch (error) {
        console.error("Error fetching Spotify data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNowPlaying();
    // Refresh every 30 seconds
    const interval = setInterval(fetchNowPlaying, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!track) {
    return <div>Not playing anything right now</div>;
  }

  return (
    <div className="flex items-center space-x-4 p-4 bg-gray-100 rounded-lg">
      <Image
        src={track.albumArt}
        alt={`${track.name} album art`}
        width={64}
        height={64}
        className="rounded-md"
      />
      <div>
        <a
          href={track.songUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium hover:underline"
        >
          {track.name}
        </a>
        <p className="text-gray-600">{track.artist}</p>
      </div>
    </div>
  );
};

export default SpotifyNowPlaying;
