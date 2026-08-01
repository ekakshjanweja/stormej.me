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
  infra/    alchemy IaC for the worker (d1, r2, durable object)
  shared/   types and constants the site and the worker both use
  config/   shared tsconfig base
```

## getting started

```bash
bun install
cp apps/web/.env.example apps/web/.env
cp apps/server/.env.example apps/server/.env           # BETTER_AUTH_SECRET + Google OAuth
cp packages/infra/.env.example packages/infra/.env     # then set ALCHEMY_PASSWORD

bun run dev              # next on :3000, alchemy worker on :8787
```

`bun run dev:web` and `bun run dev:server` start one side on its own. d1 migrations apply
automatically when the alchemy worker starts (local or deploy).

## commands

| command                 | what it does                               |
| ----------------------- | ------------------------------------------ |
| `bun run build`         | next build + next-sitemap                  |
| `bun run check-types`   | tsc across every workspace                 |
| `bun run check` / `fix` | ultracite (biome) lint + format            |
| `bun run db:generate`   | drizzle-kit generate after a schema change |
| `bun run deploy`        | `alchemy deploy` for the worker            |
| `bun run destroy`       | tear down alchemy-managed worker resources |

## the vault

`/vault` is a single-admin file manager over r2. it unlocks with a **private access key**
(`VAULT_ACCESS_KEY` in `apps/server/.env`) — a long random secret only you should know. a
successful unlock sets a first-party HttpOnly cookie; there is no public signup and no shared
accounts.

```bash
# generate once, keep offline / in a password manager
openssl rand -base64 32
# put it in apps/server/.env as VAULT_ACCESS_KEY=...
bun run deploy
# open /vault and paste the key
```

## legal

- [`/privacy`](https://www.stormej.me/privacy) — what is collected for google auth, vault, analytics
- [`/terms`](https://www.stormej.me/terms) — house rules for the personal site + private vault

## deploying

the site builds on vercel from the root `vercel.json` (`apps/web` as the service root). the worker
is managed by alchemy — [`packages/infra/alchemy.run.ts`](packages/infra/alchemy.run.ts) is the
source of truth for the r2 bucket, the d1 database and the durable object.

```bash
# ensure packages/infra/.env has ALCHEMY_PASSWORD
# ensure apps/server/.env has BETTER_AUTH_SECRET + GOOGLE_CLIENT_*
bun run deploy
```
