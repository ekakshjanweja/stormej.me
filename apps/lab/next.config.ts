import type { NextConfig } from "next";

/* the lab is served from stormej.me/experiments (see the root vercel.json),
   so every route and asset lives under this prefix, in dev too */
const BASE_PATH = "/experiments";

import { LINKS, PROJECTS, SITE, WORK } from "./lib/profile";

/* the backend: the stormej cloudflare worker (apps/server), which holds the
   spotify secrets. the lab reaches it through a same-origin rewrite, as
   apps/web does, so the browser never needs cors */
const WORKER_URL = (
	process.env.NEXT_PUBLIC_WORKER_URL ??
	(process.env.NODE_ENV === "development"
		? "http://localhost:8787"
		: "https://stormej.jekaksh.workers.dev")
).replace(/\/$/, "");

/* strip is the one live experiment; orbit and studio live in archive/ */
const ARCHIVED = ["orbit", "studio"] as const;

/* strip keeps only its home; work, writing and contact are the main
   site's own pages, so every way of asking for them goes there. the about
   page's words now open from the home's faces, so it goes home too */
const aliases = [
	{ destination: "/strip", source: "/strip/home" },
	{ destination: "/strip", source: "/strip/about" },
	{ destination: "/strip", source: "/strip/about/:path*" },
	...["blog", "blogs", "writing", "write", "notes"].map((alias) => ({
		destination: `${SITE}/blog`,
		source: `/strip/${alias}`,
	})),
	...["work", "projects", "build"].map((alias) => ({
		destination: `${SITE}/work`,
		source: `/strip/${alias}`,
	})),
	{ destination: LINKS.cal, source: "/strip/contact" },
	/* the strip's old case studies: each to its page on the main site */
	...[...WORK, ...PROJECTS].map((item) => ({
		destination: item.href,
		source: `/strip/work/${item.slug}`,
	})),
	{ destination: `${SITE}/work`, source: "/strip/work/:path*" },
];

/* old links to an archived experiment land on strip instead of a 404 */
const archived = ARCHIVED.flatMap((name) => [
	{ destination: "/strip", source: `/${name}` },
	{ destination: "/strip", source: `/${name}/:path*` },
]);

const nextConfig: NextConfig = {
	basePath: BASE_PATH,
	env: { NEXT_PUBLIC_BASE_PATH: BASE_PATH },
	/* every experiment has its own root layout, so there's no single layout
	   to build a 404 from */
	experimental: { globalNotFound: true },
	/* vercel's services routing doesn't reach /_next/image (apps/web hits the
	   same thing), and the media is already resized, so serve it as is */
	images: {
		remotePatterns: [{ hostname: "i.scdn.co", protocol: "https" }],
		unoptimized: true,
	},
	poweredByHeader: false,
	reactStrictMode: true,
	redirects() {
		return Promise.resolve([
			/* the bare base path belongs to the main site in production; in dev
			   it just points at the index */
			{ destination: "/lab", permanent: false, source: "/" },
			...[...aliases, ...archived].map((alias) => ({
				...alias,
				permanent: false,
			})),
		]);
	},
	rewrites() {
		return Promise.resolve([
			/* what's playing, from the worker's /spotify */
			{ destination: `${WORKER_URL}/spotify`, source: "/api/spotify" },
		]);
	},
};

export default nextConfig;
