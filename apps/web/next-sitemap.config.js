const fs = require("node:fs");
// Not `path`, which is the name transform() below gives its route argument.
const nodePath = require("node:path");

// This config is commonjs and runs outside the bundler, so it cannot import
// lib/trove-config.ts. Read the flag as text instead. Anything other than a
// literal `= true` counts as off, so a disabled section can never be
// advertised in the sitemap while its pages 404.
const troveEnabled = /TROVE_ENABLED:\s*boolean\s*=\s*true/.test(
	fs.readFileSync(
		nodePath.join(import.meta.dirname, "lib", "trove-config.ts"),
		"utf-8"
	)
);

/** @type {import('next-sitemap').IConfig} */
module.exports = {
	changefreq: "weekly",
	exclude: ["/api/*", "/og", "/og/*", "/llms.txt"],
	generateRobotsTxt: false,
	priority: 0.7,
	siteUrl: process.env.SITE_URL || "https://www.stormej.me",
	transform: async (config, path) => {
		if (!troveEnabled && (path === "/trove" || path.startsWith("/trove/"))) {
			return null;
		}

		let priority = 0.7;
		let changefreq = "weekly";
		if (path === "/") {
			priority = 1.0;
			changefreq = "weekly";
		} else if (
			path === "/work" ||
			path === "/projects" ||
			path === "/blog" ||
			path === "/trove"
		) {
			priority = 0.9;
		} else if (
			path.startsWith("/work/") ||
			path.startsWith("/projects/") ||
			path.startsWith("/blog/") ||
			path.startsWith("/trove/")
		) {
			priority = 0.8;
		} else if (path === "/gear") {
			priority = 0.5;
		}
		return {
			changefreq,
			lastmod: new Date().toISOString(),
			loc: path,
			priority,
		};
	},
};
