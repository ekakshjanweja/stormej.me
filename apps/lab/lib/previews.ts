"use client";

import type { SpotifyStatus, SpotifyTrack } from "./spotify";

/* spotify stopped handing out preview clips to new apps, so the clips come
   from the itunes store's search instead: free, no key, 30 seconds of most
   songs. it's asked from the visitor's browser (it allows any origin):
   asked from the worker, cloudflare's shared addresses only get 429s. a
   song's clip doesn't change, so each is looked up once per visit (real
   misses too). its storefronts differ, so india first, then the us */
const ITUNES = "https://itunes.apple.com/search";
const STOREFRONTS = ["IN", "US"] as const;
const PREVIEW_TIMEOUT_MS = 4000;
const ITUNES_LIMIT = 10;
const BRACKETS = /\s*[([].*?[)\]]/g;
const NOT_WORDS = /[^\p{L}\p{N}]+/gu;
const previews = new Map<string, Promise<string | null>>();

interface ItunesSong {
	artistName: string;
	previewUrl?: string;
	trackName: string;
}

/* "Deewana (feat. x)" and "deewana" are the same song */
const plain = (text: string) =>
	text.toLowerCase().replace(BRACKETS, "").replace(NOT_WORDS, " ").trim();

/* a clip, or null when no storefront has the song. throws when a
   storefront couldn't be asked, so a passing failure isn't remembered as
   "no clip" */
const findPreview = async (track: SpotifyTrack): Promise<string | null> => {
	const title = plain(track.title);
	const artists = track.artists.split(", ").map(plain);
	let failed = false;
	for (const country of STOREFRONTS) {
		try {
			const query = new URLSearchParams({
				country,
				entity: "song",
				limit: String(ITUNES_LIMIT),
				term: `${track.title} ${track.artists.split(", ")[0] ?? ""}`,
			});
			// biome-ignore lint/performance/noAwaitInLoops: storefronts are tried in turn, the next only when one misses
			const response = await fetch(`${ITUNES}?${query}`, {
				signal: AbortSignal.timeout(PREVIEW_TIMEOUT_MS),
			});
			if (!response.ok) {
				failed = true;
				continue;
			}
			const { results } = (await response.json()) as {
				results: ItunesSong[];
			};
			const match = results.find(
				(song) =>
					song.previewUrl &&
					plain(song.trackName) === title &&
					artists.some((artist) => plain(song.artistName).includes(artist))
			);
			if (match?.previewUrl) {
				return match.previewUrl;
			}
		} catch {
			failed = true;
		}
	}
	if (failed) {
		throw new Error("itunes couldn't be asked; try again on a later poll");
	}
	return null;
};

/* found clips and real misses are kept; failed lookups are dropped, so the
   next poll asks again */
const previewFor = (track: SpotifyTrack) => {
	const key = `${track.title}|${track.artists}`;
	let found = previews.get(key);
	if (!found) {
		found = findPreview(track).catch(() => {
			previews.delete(key);
			return null;
		});
		previews.set(key, found);
	}
	return found;
};

/** the same status, with a clip on every track the store has one for */
export const withPreviews = async (
	status: SpotifyStatus
): Promise<SpotifyStatus> => {
	const fill = async (item: SpotifyTrack) =>
		item.preview ? item : { ...item, preview: await previewFor(item) };
	const [track, top] = await Promise.all([
		status.track ? fill(status.track) : null,
		Promise.all(status.top.map(fill)),
	]);
	return { ...status, top, track };
};
