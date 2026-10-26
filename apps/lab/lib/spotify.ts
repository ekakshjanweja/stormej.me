/* what i'm listening to. the stormej worker (apps/server, routes/spotify)
   asks spotify and holds the secrets; the lab reaches it at /api/spotify
   through a rewrite (next.config.ts). these are the shapes it answers with,
   kept in step with the worker's */

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
