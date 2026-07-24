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

const projectFrontmatterSchema = frontmatterSchema.extend({
	github: z.string().optional(),
	hidden: z.boolean().optional(),
	images: z.array(z.string()).optional(),
	inlineGallery: z.boolean().optional(),
	published: z.boolean().optional(),
	subtitle: z.string().optional(),
	tech: z.array(z.string()).default([]),
	website: z.string().optional(),
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

const workImageAssetSchema = z.union([
	z.string(),
	z.object({ dark: z.string(), light: z.string() }),
]);

const workChapterNavSchema = z.object({
	id: z.string(),
	label: z.string(),
});

const workFrontmatterSchema = frontmatterSchema.extend({
	appStore: z.string().optional(),
	challenge: z.string().optional(),
	chapters: z.array(workChapterNavSchema).optional(),
	endDate: z.coerce.date().optional(),
	images: z.array(workImageAssetSchema).optional(),
	logo: workImageAssetSchema.optional(),
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

const publicationFrontmatterSchema = frontmatterSchema.extend({
	arxivId: z.string().optional(),
	arxivUrl: z.string().optional(),
	authors: z.array(z.string()).default([]),
	date: z.string().optional(),
	doi: z.string().optional(),
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
