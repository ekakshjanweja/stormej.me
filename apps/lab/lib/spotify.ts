/* what i'm listening to, from the spotify web api. server only: it holds the
   client secret and a long-lived refresh token (see scripts/spotify-token.ts).
   without them every experiment just leaves the player out */

export interface SpotifyTrack {
	album: string;
	/** the largest cover spotify has, or null for local files */
	albumArt: string | null;
	artists: string;
	/** a 30 second clip from the itunes store, where it has the song */
	preview: string | null;
	title: string;
	url: string;
}

export interface SpotifyStatus {
	/** false until the secret and refresh token are set */
	configured: boolean;
	durationMs: number | null;
	/** when spotify was asked (ms since epoch), so a cached answer's
	    progress can be carried forward to now */
	fetchedAt: number;
	isPlaying: boolean;
	/** when the last track finished, if nothing is playing now */
	playedAt: string | null;
	progressMs: number | null;
	/** the four most played over the last four weeks */
	top: SpotifyTrack[];
	/** playing now, or the last thing played */
	track: SpotifyTrack | null;
}

/* not a secret: it's in every authorize url */
const CLIENT_ID =
	process.env.SPOTIFY_CLIENT_ID ?? "0880051b40ab46e59ed865c40f83b81b";
const TOKEN_URL = "https://accounts.spotify.com/api/token";
const API = "https://api.spotify.com/v1";
const TIMEOUT_MS = 4000;
/* refresh a little before spotify says the token runs out */
const EXPIRY_MARGIN_MS = 60_000;
const NO_CONTENT = 204;
const TOP_COUNT = 4;

const EMPTY: SpotifyStatus = {
	configured: false,
	durationMs: null,
	fetchedAt: 0,
	isPlaying: false,
	playedAt: null,
	progressMs: null,
	top: [],
	track: null,
};

interface ApiImage {
	url: string;
	width: number | null;
}

interface ApiTrack {
	album: { images: ApiImage[]; name: string };
	artists: { name: string }[];
	duration_ms: number;
	external_urls: { spotify?: string };
	name: string;
	type: "track";
}

interface CurrentlyPlaying {
	currently_playing_type: string;
	is_playing: boolean;
	item: ApiTrack | null;
	progress_ms: number | null;
}

interface RecentlyPlayed {
	items: { played_at: string; track: ApiTrack }[];
}

interface TopTracks {
	items: ApiTrack[];
}

let cachedToken: { expires: number; value: string } | null = null;

const credentials = () => {
	const secret = process.env.SPOTIFY_CLIENT_SECRET;
	const refresh = process.env.SPOTIFY_REFRESH_TOKEN;
	return secret && refresh ? { refresh, secret } : null;
};

const accessToken = async (secret: string, refresh: string) => {
	if (cachedToken && cachedToken.expires > Date.now()) {
		return cachedToken.value;
	}
	const response = await fetch(TOKEN_URL, {
		body: new URLSearchParams({
			grant_type: "refresh_token",
			refresh_token: refresh,
		}),
		cache: "no-store",
		headers: {
			Authorization: `Basic ${btoa(`${CLIENT_ID}:${secret}`)}`,
			"Content-Type": "application/x-www-form-urlencoded",
		},
		method: "POST",
		signal: AbortSignal.timeout(TIMEOUT_MS),
	});
	if (!response.ok) {
		throw new Error(`spotify token refresh failed with ${response.status}`);
	}
	const data = (await response.json()) as {
		access_token: string;
		expires_in: number;
	};
	cachedToken = {
		expires: Date.now() + data.expires_in * 1000 - EXPIRY_MARGIN_MS,
		value: data.access_token,
	};
	return data.access_token;
};

const get = async <T>(token: string, path: string): Promise<T | null> => {
	const response = await fetch(`${API}${path}`, {
		cache: "no-store",
		headers: { Authorization: `Bearer ${token}` },
		signal: AbortSignal.timeout(TIMEOUT_MS),
	});
	if (response.status === NO_CONTENT) {
		return null;
	}
	if (!response.ok) {
		throw new Error(`spotify ${path} failed with ${response.status}`);
	}
	return (await response.json()) as T;
};

/* spotify stopped handing out preview clips to new apps, so the clips come
   from the itunes store's search instead: free, no key, 30 seconds of most
   songs. a song's clip doesn't change, so each is looked up once per server
   (misses too). its storefronts differ, so india first, then the us */
const ITUNES = "https://itunes.apple.com/search";
const STOREFRONTS = ["IN", "US"] as const;
const PREVIEW_TIMEOUT_MS = 2500;
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

const findPreview = async (track: ApiTrack): Promise<string | null> => {
	const title = plain(track.name);
	const artists = track.artists.map((artist) => plain(artist.name));
	for (const country of STOREFRONTS) {
		try {
			const query = new URLSearchParams({
				country,
				entity: "song",
				limit: String(ITUNES_LIMIT),
				term: `${track.name} ${track.artists.at(0)?.name ?? ""}`,
			});
			// biome-ignore lint/performance/noAwaitInLoops: storefronts are tried in turn, the next only when one misses
			const response = await fetch(`${ITUNES}?${query}`, {
				signal: AbortSignal.timeout(PREVIEW_TIMEOUT_MS),
			});
			if (!response.ok) {
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
			/* a slow or failed storefront: try the next */
		}
	}
	return null;
};

const previewFor = (track: ApiTrack) => {
	const key = `${track.name}|${track.artists.at(0)?.name ?? ""}`;
	let found = previews.get(key);
	if (!found) {
		found = findPreview(track);
		previews.set(key, found);
	}
	return found;
};

const toTrack = async (track: ApiTrack): Promise<SpotifyTrack> => {
	const [largest] = [...track.album.images].sort(
		(a, b) => (b.width ?? 0) - (a.width ?? 0)
	);
	return {
		album: track.album.name,
		albumArt: largest?.url ?? null,
		artists: track.artists.map((artist) => artist.name).join(", "),
		preview: await previewFor(track),
		title: track.name,
		url: track.external_urls.spotify ?? "https://open.spotify.com",
	};
};

/* top tracks can fail on their own (an older token without user-top-read)
   without taking the player down */
const topTracks = async (token: string) => {
	try {
		const top = await get<TopTracks>(
			token,
			`/me/top/tracks?time_range=short_term&limit=${TOP_COUNT}`
		);
		return await Promise.all(top?.items.map(toTrack) ?? []);
	} catch {
		return [];
	}
};

export const getSpotifyStatus = async (): Promise<SpotifyStatus> => {
	const keys = credentials();
	if (!keys) {
		return EMPTY;
	}
	try {
		const token = await accessToken(keys.secret, keys.refresh);
		const [now, top] = await Promise.all([
			get<CurrentlyPlaying>(token, "/me/player/currently-playing"),
			topTracks(token),
		]);
		const playingTrack =
			now?.currently_playing_type === "track" && now.item ? now.item : null;
		if (now?.is_playing && playingTrack) {
			return {
				configured: true,
				durationMs: playingTrack.duration_ms,
				fetchedAt: Date.now(),
				isPlaying: true,
				playedAt: null,
				progressMs: now.progress_ms,
				top,
				track: await toTrack(playingTrack),
			};
		}
		const recent = await get<RecentlyPlayed>(
			token,
			"/me/player/recently-played?limit=1"
		);
		const last = recent?.items[0];
		return {
			...EMPTY,
			configured: true,
			fetchedAt: Date.now(),
			playedAt: last?.played_at ?? null,
			top,
			track: last ? await toTrack(last.track) : null,
		};
	} catch {
		cachedToken = null;
		return { ...EMPTY, configured: true };
	}
};
