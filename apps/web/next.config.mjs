import { createMDX } from "fumadocs-mdx/next";

const workerUrl = (
	process.env.NEXT_PUBLIC_WORKER_URL ??
	(process.env.NODE_ENV === "development"
		? "http://localhost:8787"
		: "https://stormej.jekaksh.workers.dev")
).replace(/\/$/, "");

/** @type {import('next').NextConfig} */
const nextConfig = {
	compress: true,

	images: {
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		formats: ["image/avif", "image/webp"],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
		remotePatterns: [
			{ hostname: "cdn.hashnode.com", protocol: "https" },
			{ hostname: "**.hashnode.com", protocol: "https" },
			{ hostname: "api.microlink.io", protocol: "https" },
			{ hostname: "i.ytimg.com", protocol: "https" },
		],
		// the vercel services routing in vercel.json never registers /_next/image,
		// so the optimizer 404s in prod and every non-svg image breaks. serve
		// originals until that routing is fixed.
		unoptimized: true,
	},
	poweredByHeader: false,
	reactStrictMode: true,

	async rewrites() {
		return [
			{
				destination: `${workerUrl}/files/:path*`,
				source: "/files/:path*",
			},
			{
				destination: `${workerUrl}/admin/:path*`,
				source: "/admin/:path*",
			},
			{
				destination: `${workerUrl}/api/auth/:path*`,
				// proxied so the better-auth cookie is same-origin with the site
				source: "/api/auth/:path*",
			},
			{
				destination: "https://us-assets.i.posthog.com/static/:path*",
				source: "/ingest/static/:path*",
			},
			{
				destination: "https://us.i.posthog.com/:path*",
				source: "/ingest/:path*",
			},
			{
				destination: "https://us.i.posthog.com/decide",
				source: "/ingest/decide",
			},
		];
	},
};

const withMDX = createMDX();

export default withMDX(nextConfig);
