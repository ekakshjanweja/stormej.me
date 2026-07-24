# stormej.me

a bun workspace laid out the way [better-t-stack](https://better-t-stack.dev) generates
`next + hono + workers + better-auth + drizzle/d1`, with turborepo, biome and ultracite on top.

```
apps/
  web/      next.js site (fumadocs mdx content, deployed to vercel)
  server/   hono worker (r2 uploads, realtime durable object, better-auth) on cloudflare
packages/
  auth/     better-auth instance over drizzle
  db/       drizzle schema + d1 client, migrations in src/migrations
  shared/   types and constants the site and the worker both use
  config/   shared tsconfig base
```

## getting started

```bash
bun install
cp apps/web/.env.example apps/web/.env
cp apps/server/.dev.vars.example apps/server/.dev.vars   # then set BETTER_AUTH_SECRET

bun run db:migrate       # apply migrations to the local d1
bun run dev              # next on :3000, wrangler on :8787
```

`bun run dev:web` and `bun run dev:server` start one side on its own.

## commands

| command                   | what it does                                     |
| ------------------------- | ------------------------------------------------ |
| `bun run build`           | next build + next-sitemap                        |
| `bun run check-types`     | tsc across every workspace                       |
| `bun run check` / `fix`   | ultracite (biome) lint + format                  |
| `bun run db:generate`     | drizzle-kit generate after a schema change       |
| `bun run db:migrate`      | apply migrations to the local d1                 |
| `bun run db:migrate:remote` | apply migrations to the remote d1              |
| `bun run deploy:server`   | `wrangler deploy` from apps/server               |

## the vault

`/vault` is a single-admin file manager over r2. auth is better-auth on the worker, mounted at
`/api/auth`, which next rewrites to so the session cookie stays first party. signup is closed
unless `ALLOW_SIGNUP=true` is set on the worker — set it once to seed the admin account, then
remove it.

```bash
curl -X POST http://localhost:8787/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"...","name":"you"}'
```

## deploying

the site builds on vercel from the root `vercel.json` (`apps/web` as the service root). the worker
ships with `wrangler deploy` from `apps/server`; it is not managed by alchemy, so `wrangler.jsonc`
is the source of truth for the r2 bucket, the d1 database and the durable object.

worker secrets go in with `wrangler secret put BETTER_AUTH_SECRET`.
