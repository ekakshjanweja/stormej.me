import {
  defineDocs,
  defineConfig,
  frontmatterSchema,
} from "fumadocs-mdx/config";
import {
  rehypeCodeDefaultOptions,
  remarkMdxMermaid,
} from "fumadocs-core/mdx-plugins";
import { remarkMdxFiles } from "fumadocs-core/mdx-plugins/remark-mdx-files";
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
  subtitle: z.string().optional(),
  tech: z.array(z.string()).default([]),
  website: z.string().optional(),
  github: z.string().optional(),
  youtube: z.string().optional(),
  images: z.array(z.string()).optional(),
  inlineGallery: z.boolean().optional(),
  hidden: z.boolean().optional(),
  published: z.boolean().optional(),
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
  z.object({ light: z.string(), dark: z.string() }),
]);

const workChapterNavSchema = z.object({
  id: z.string(),
  label: z.string(),
});

const workFrontmatterSchema = frontmatterSchema.extend({
  subtitle: z.string().optional(),
  role: z.string(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  website: z.string().optional(),
  tech: z.array(z.string()).default([]),
  logo: z.string().optional(),
  images: z.array(workImageAssetSchema).optional(),
  screenshotMockup: z.literal("iphone-17-pro").optional(),
  challenge: z.string().optional(),
  chapters: z.array(workChapterNavSchema).optional(),
  published: z.boolean().optional(),
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

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [remarkMdxMermaid, remarkMdxFiles],
    rehypeCodeOptions: {
      ...rehypeCodeDefaultOptions,
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
      langAlias: {
        svg: "xml",
        text: "md",
      },
    },
  },
});
