import Image from "next/image";
import { useEffect, useState } from "react";

interface SpotifyTrack {
	albumArt: string;
	artist: string;
	name: string;
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
						albumArt: data.albumImageUrl,
						artist: data.artist,
						name: data.title,
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
		const interval = setInterval(fetchNowPlaying, 30_000);

		return () => clearInterval(interval);
	}, []);

	if (loading) {
		return <div>Loading...</div>;
	}

	if (!track) {
		return <div>Not playing anything right now</div>;
	}

	return (
		<div className="flex items-center space-x-4 rounded-lg bg-gray-100 p-4">
			<Image
				alt={`${track.name} album art`}
				className="rounded-md"
				height={64}
				src={track.albumArt}
				width={64}
			/>
			<div>
				<a
					className="font-medium hover:underline"
					href={track.songUrl}
					rel="noopener noreferrer"
					target="_blank"
				>
					{track.name}
				</a>
				<p className="text-gray-600">{track.artist}</p>
			</div>
		</div>
	);
};

export default SpotifyNowPlaying;
