// @ts-nocheck
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const docs = await create.docs("docs", "content/blogs", {}, {});

export const projects = await create.docs("projects", "content/projects", {}, {});

export const work = await create.docs("work", "content/work", {}, {});