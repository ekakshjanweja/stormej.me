import { youtubePlaylist } from "@/lib/constants/links";

export interface Video {
	durationSeconds: number;
	id: string;
	title: string;
}

export const HOME_VIDEOS_LIMIT = 2;

export const YOUTUBE_PLAYLIST = youtubePlaylist;

const VIDEOS: Video[] = [
	{
		durationSeconds: 1376,
		id: "uX_zaJGLIvQ",
		title: "The Cleanest Way to Handle Dark/Light Mode in Flutter",
	},
	{
		durationSeconds: 2691,
		id: "35pCXqScBzo",
		title: "A Deep Dive Into S.O.L.I.D Principles",
	},
	{
		durationSeconds: 1778,
		id: "-cOaBFU39Lc",
		title: "Flutter Bootcamp GDSC DTU Clips",
	},
	{
		durationSeconds: 4792,
		id: "kyxphe7FTNc",
		title: "Flutter Forward Extended: A Live Session",
	},
	{
		durationSeconds: 6706,
		id: "4bb7QfaZ-Kw",
		title: "Flutter Forward Extended: Building A Portfolio App",
	},
];

export function listVideos(): Video[] {
	return VIDEOS;
}

export function videoHref(id: string): string {
	return `https://www.youtube.com/watch?v=${id}`;
}

export function videoThumbnailUrl(id: string): string {
	return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export function formatVideoDuration(seconds: number): string {
	const minutes = Math.round(seconds / 60);
	return `${minutes} min`;
}
