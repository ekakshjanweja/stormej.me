import {
	rehypeCodeDefaultOptions,
	remarkMdxMermaid,
} from "fumadocs-core/mdx-plugins";
import { remarkMdxFiles } from "fumadocs-core/mdx-plugins/remark-mdx-files";
import {
	defineConfig,
	defineDocs,
	frontmatterSchema,
} from "fumadocs-mdx/config";
import { z } from "zod";

export const docs = defineDocs({
	dir: "content/blogs",
	docs: {
		files: ["*.mdx"],
		schema: frontmatterSchema.extend({
			date: z.string().optional(),
			published: z.boolean().optional(),
		}),
	},
	meta: {
		files: ["*.json"],
	},
});

const workImageAssetSchema = z.union([
	z.string(),
	z.object({ dark: z.string(), light: z.string() }),
]);

const projectFrontmatterSchema = frontmatterSchema.extend({
	/** tint behind the home card's media, any css colour */
	accent: z.string().optional(),
	archived: z.boolean().optional(),
	/** home card media: an image or an mp4/webm, overrides the video/youtube/site fallbacks */
	cover: z.string().optional(),
	/** the cover clip's first frame, when it isn't the demo's poster */
	coverPoster: z.string().optional(),
	github: z.string().optional(),
	hidden: z.boolean().optional(),
	/** three or four short lines under the project page's header */
	highlights: z.array(z.string()).optional(),
	/** square app icon, shown on the home card and the project page */
	icon: z.string().optional(),
	images: z.array(z.string()).optional(),
	imagesOrientation: z.enum(["portrait", "landscape"]).optional(),
	inlineGallery: z.boolean().optional(),
	/** what it is, in two words: "mac app", "flutter package" */
	kind: z.string().optional(),
	/** a short paragraph for the pinned overview on the project page */
	overview: z.string().optional(),
	/** where it runs: "macos · menu bar" */
	platform: z.string().optional(),
	published: z.boolean().optional(),
	/** "live", "beta", "open source"... shown with a dot */
	status: z.string().optional(),
	subtitle: z.string().optional(),
	tech: z.array(z.string()).default([]),
	video: z.string().optional(),
	/** a phone recording plays in a tall frame */
	videoOrientation: z.enum(["portrait", "landscape"]).optional(),
	videoPoster: z.string().optional(),
	website: z.string().optional(),
	year: z.number().optional(),
	youtube: z.string().optional(),
});

export const projects = defineDocs({
	dir: "content/projects",
	docs: {
		files: ["*.mdx"],
		schema: projectFrontmatterSchema,
	},
	meta: {
		files: ["*.json"],
	},
});

const workChapterNavSchema = z.object({
	id: z.string(),
	label: z.string(),
	/** desktop/laptop shots instead of phone screens */
	landscape: z.boolean().optional(),
	/** the screens that sit beside this chapter while it is being read */
	media: z.array(workImageAssetSchema).optional(),
});

const workFrontmatterSchema = frontmatterSchema.extend({
	/** tint behind the home card's media, any css colour */
	accent: z.string().optional(),
	appStore: z.string().optional(),
	challenge: z.string().optional(),
	chapters: z.array(workChapterNavSchema).optional(),
	endDate: z.coerce.date().optional(),
	images: z.array(workImageAssetSchema).optional(),
	logo: workImageAssetSchema.optional(),
	/** a short paragraph for the pinned overview; falls back to the description */
	overview: z.string().optional(),
	playStore: z.string().optional(),
	published: z.boolean().optional(),
	role: z.string(),
	screenshotMockup: z.literal("iphone-17-pro").optional(),
	startDate: z.coerce.date(),
	subtitle: z.string().optional(),
	tech: z.array(z.string()).default([]),
	website: z.string().optional(),
});

export const work = defineDocs({
	dir: "content/work",
	docs: {
		files: ["*.mdx"],
		schema: workFrontmatterSchema,
	},
	meta: {
		files: ["*.json"],
	},
});

const huggingFaceRepoSchema = z.object({
	id: z.string(),
	label: z.string().optional(),
	type: z.enum(["dataset", "model", "space"]).default("dataset"),
});

const publicationFrontmatterSchema = frontmatterSchema.extend({
	arxivId: z.string().optional(),
	arxivUrl: z.string().optional(),
	authors: z.array(z.string()).default([]),
	date: z.string().optional(),
	doi: z.string().optional(),
	huggingface: z.array(huggingFaceRepoSchema).optional(),
	pdfUrl: z.string().optional(),
	published: z.boolean().optional(),
	venue: z.string().optional(),
});

export const publications = defineDocs({
	dir: "content/publications",
	docs: {
		files: ["*.mdx"],
		schema: publicationFrontmatterSchema,
	},
	meta: {
		files: ["*.json"],
	},
});

const troveFrontmatterSchema = frontmatterSchema.extend({
	date: z.string().optional(),
	demo: z.string().optional(),
	github: z.string().optional(),
	hidden: z.boolean().optional(),
	lines: z.number().optional(),
	orchestrator: z.boolean().optional(),
	published: z.boolean().optional(),
	sourceFile: z.string().optional(),
	subtitle: z.string().optional(),
	tech: z.array(z.string()).default([]),
});

export const trove = defineDocs({
	dir: "content/trove",
	docs: {
		files: ["*.mdx"],
		schema: troveFrontmatterSchema,
	},
	meta: {
		files: ["*.json"],
	},
});

export default defineConfig({
	mdxOptions: {
		rehypeCodeOptions: {
			...rehypeCodeDefaultOptions,
			langAlias: {
				svg: "xml",
				text: "md",
			},
			langs: [
				"xml",
				"kotlin",
				"swift",
				"ts",
				"tsx",
				"js",
				"jsx",
				"json",
				"bash",
				"shell",
				"dart",
				"yaml",
				"css",
				"html",
				"md",
				"mdx",
				"diff",
			],
		},
		remarkPlugins: [remarkMdxMermaid, remarkMdxFiles],
	},
});
