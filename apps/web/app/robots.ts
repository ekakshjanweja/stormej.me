import type { MetadataRoute } from "next";

const SITE = "https://www.stormej.me";

const AI_CRAWLERS = [
	"GPTBot",
	"OAI-SearchBot",
	"ChatGPT-User",
	"ClaudeBot",
	"Claude-Web",
	"anthropic-ai",
	"PerplexityBot",
	"Perplexity-User",
	"Google-Extended",
	"Applebot-Extended",
	"CCBot",
	"Bytespider",
	"Amazonbot",
	"cohere-ai",
	"DuckAssistBot",
	"MistralAI-User",
	"YouBot",
];

export default function robots(): MetadataRoute.Robots {
	return {
		host: SITE,
		rules: [
			{ allow: "/", disallow: ["/api/", "/og/"], userAgent: "*" },
			...AI_CRAWLERS.map((userAgent) => ({ allow: "/", userAgent })),
		],
		sitemap: `${SITE}/sitemap.xml`,
	};
}
