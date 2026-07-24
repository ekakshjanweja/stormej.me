# server

the hono worker. it serves three things:

- **`/files/*`** — public reads out of the `stormej-storage` r2 bucket
- **`/admin/*`** — vault writes, behind a better-auth session
  ([`src/middleware/require-session.ts`](src/middleware/require-session.ts))
- **`/ws`** — the live-cursor durable object ([`src/durable-objects.ts`](src/durable-objects.ts))

better-auth is mounted at `/api/auth` and lives in [`@stormej/auth`](../../packages/auth), backed by
drizzle over d1 ([`@stormej/db`](../../packages/db)).

## local

```bash
cp .dev.vars.example .dev.vars    # then set BETTER_AUTH_SECRET
bun run db:migrate                # applies packages/db/src/migrations to the local d1
bun run dev                       # wrangler dev on :8787
```

## deploying

this worker is deployed with wrangler, not alchemy — `wrangler.jsonc` is the source of truth for the
r2 bucket, the d1 database and the durable object migration.

```bash
bunx wrangler secret put BETTER_AUTH_SECRET
bun run db:migrate:remote
bun run deploy
```

`bun run cf-typegen` regenerates `worker-configuration.d.ts` after a binding changes.
