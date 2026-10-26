/* one-time: sign in to spotify and save a refresh token for the lab.

   1. put SPOTIFY_CLIENT_SECRET=... in apps/lab/.env.local (from the spotify
      dashboard, app "portfolio" → settings)
   2. bun run spotify:token   (from apps/lab; port 3000 must be free)
   3. approve in the browser. the refresh token is appended to .env.local
   4. copy SPOTIFY_CLIENT_SECRET and SPOTIFY_REFRESH_TOKEN into the vercel
      project's environment variables and redeploy

   the redirect uri has to match one listed in the dashboard exactly. it
   defaults to http://127.0.0.1:3000/callback (spotify rejects localhost as
   insecure); set SPOTIFY_REDIRECT_URI to use another. the refresh token
   lasts 180 days, after which run this again */

import { appendFile } from "node:fs/promises";
import { join } from "node:path";
import { serve, spawn } from "bun";

const CLIENT_ID =
	process.env.SPOTIFY_CLIENT_ID ?? "0880051b40ab46e59ed865c40f83b81b";
const SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT =
	/* spotify turns down "localhost" as insecure; the loopback address it takes */
	process.env.SPOTIFY_REDIRECT_URI ?? "http://127.0.0.1:3000/callback";
const SCOPES = [
	"user-read-currently-playing",
	"user-read-recently-played",
	"user-top-read",
];
const ENV_FILE = join(import.meta.dir, "..", ".env.local");

if (!SECRET) {
	console.error(
		"add SPOTIFY_CLIENT_SECRET to apps/lab/.env.local first (spotify dashboard → portfolio → settings)"
	);
	process.exit(1);
}

const redirect = new URL(REDIRECT);
const state = crypto.randomUUID();
const authorize = new URL("https://accounts.spotify.com/authorize");
authorize.search = new URLSearchParams({
	client_id: CLIENT_ID,
	redirect_uri: REDIRECT,
	response_type: "code",
	scope: SCOPES.join(" "),
	state,
}).toString();

const page = (message: string) =>
	new Response(
		`<!doctype html><meta charset="utf-8"><title>spotify</title><body style="font:16px system-ui;padding:3rem;background:#f5f6f2;color:#111311">${message}</body>`,
		{ headers: { "Content-Type": "text/html; charset=utf-8" } }
	);

const exchange = async (code: string) => {
	const response = await fetch("https://accounts.spotify.com/api/token", {
		body: new URLSearchParams({
			code,
			grant_type: "authorization_code",
			redirect_uri: REDIRECT,
		}),
		headers: {
			Authorization: `Basic ${btoa(`${CLIENT_ID}:${SECRET}`)}`,
			"Content-Type": "application/x-www-form-urlencoded",
		},
		method: "POST",
	});
	if (!response.ok) {
		throw new Error(
			`token exchange failed (${response.status}): ${await response.text()}`
		);
	}
	const data = (await response.json()) as { refresh_token?: string };
	if (!data.refresh_token) {
		throw new Error("spotify didn't return a refresh token");
	}
	return data.refresh_token;
};

const server = serve({
	async fetch(request) {
		const url = new URL(request.url);
		if (url.pathname !== redirect.pathname) {
			return new Response("not found", { status: 404 });
		}
		const error = url.searchParams.get("error");
		const code = url.searchParams.get("code");
		if (error || !code || url.searchParams.get("state") !== state) {
			console.error(`spotify said no: ${error ?? "missing code or state"}`);
			setTimeout(() => server.stop(), 100);
			return page("that didn't work. check the terminal.");
		}
		try {
			const refresh = await exchange(code);
			await appendFile(ENV_FILE, `\nSPOTIFY_REFRESH_TOKEN=${refresh}\n`);
			console.log(`saved SPOTIFY_REFRESH_TOKEN to ${ENV_FILE}`);
			return page("done. you can close this tab.");
		} catch (cause) {
			console.error(cause instanceof Error ? cause.message : cause);
			return page("the token exchange failed. check the terminal.");
		} finally {
			setTimeout(() => server.stop(), 100);
		}
	},
	port: Number(redirect.port || 80),
});

console.log(`open this to sign in to spotify:\n\n${authorize.toString()}\n`);
console.log(
	`if spotify says "INVALID_CLIENT: Invalid redirect URI", add ${REDIRECT} to the app's redirect uris (exactly, 127.0.0.1 and not localhost) and run again`
);
spawn(["open", authorize.toString()]);
