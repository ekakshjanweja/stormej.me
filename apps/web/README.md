# web

the next.js site. run it from the repo root with `bun run dev` (or `bun run dev:web` for just this
app) so the workspace packages resolve.

## content

everything under `content/` is fumadocs mdx, wired up in [`source.config.ts`](source.config.ts):

| directory              | surface         | listing logic                            |
| ---------------------- | --------------- | ---------------------------------------- |
| `content/blogs`        | `/blog`         | [`lib/blog.ts`](lib/blog.ts)             |
| `content/work`         | `/work`         | [`lib/work.ts`](lib/work.ts)             |
| `content/projects`     | `/projects`     | [`lib/projects.ts`](lib/projects.ts)     |
| `content/publications` | `/publications` | [`lib/publication.ts`](lib/publication.ts) |
| `content/trove`        | `/trove`        | [`lib/trove.ts`](lib/trove.ts)           |

each file uses yaml front matter (`title`, `date`, `description`, optional `published`).

- **`published`** (optional): omit or `true` to list the post on `/blog` and the homepage blog
  section. set to `false` to **unpublish** — hidden from those lists, but the post is still
  reachable at `/blog/[slug]` if you share the link.

## trove demos

`/trove/<slug>` embeds a flutter web build served from `public/trove/`. rebuild one after changing
its source:

```bash
bun run build:trove app-toast   # or with no argument to rebuild every demo
bun run sync:trove              # pull the dart sources back into content/
```

set `TROVE_DIR` if the flutter repo isn't at `~/dev/experiments/trove`. the whole section can be
switched off in [`lib/trove-config.ts`](lib/trove-config.ts); the sitemap reads that same flag so a
disabled section is never advertised.

## the worker

`/files/*`, `/admin/*` and `/api/auth/*` are rewritten to the hono worker in
[`next.config.mjs`](next.config.mjs). point `NEXT_PUBLIC_WORKER_URL` at it; it defaults to
`http://localhost:8787` in development.
