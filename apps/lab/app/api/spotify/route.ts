import { withBase } from "@/lib/base";
import { getSpotifyStatus, type SpotifyStatus } from "@/lib/spotify";

/* every visitor polls this, so let the cdn hold it for a beat */
const CACHE = "public, s-maxage=30, stale-while-revalidate=60";

/* ?demo=1 in dev, so the players can be designed before spotify is set up */
const demo = (): SpotifyStatus => {
	const track = (title: string, cover: string) => ({
		album: "demo album",
		albumArt: withBase(`/media/ig/${cover}.webp`),
		artists: "demo artist",
		preview: null,
		title,
		url: "https://open.spotify.com",
	});
	return {
		configured: true,
		durationMs: 214_000,
		fetchedAt: Date.now(),
		isPlaying: true,
		playedAt: null,
		progressMs: 81_000,
		top: [
			track("first demo track", "De695u9iGL5"),
			track("second demo track", "DewVeY2ixQP"),
			track("third demo track", "DerCwzLCNFR"),
			track("fourth demo track", "DejyibXiKjs"),
			track("fifth demo track", "DefFgUrC4Si"),
		],
		track: track("a demo track with a longer title", "DeXN1v_zjYM"),
	};
};

export async function GET(request: Request) {
	const wantsDemo =
		process.env.NODE_ENV === "development" &&
		new URL(request.url).searchParams.has("demo");
	const status = wantsDemo ? demo() : await getSpotifyStatus();
	return Response.json(status, { headers: { "Cache-Control": CACHE } });
}
