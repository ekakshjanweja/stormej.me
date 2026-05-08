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
  dir: "content",
  docs: {
    schema: frontmatterSchema.extend({
      date: z.string().optional(),
      published: z.boolean().optional(),
    }),
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
