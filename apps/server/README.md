# server

the hono worker. it serves three things:

- **`/files/*`** — public reads out of the `stormej-storage` r2 bucket
- **`/admin/*`** — vault writes, behind a better-auth session
  ([`src/middleware/require-session.ts`](src/middleware/require-session.ts))
- **`/ws`** — the live-cursor durable object ([`src/durable-objects.ts`](src/durable-objects.ts))

better-auth is mounted at `/api/auth` and lives in [`@stormej/auth`](../../packages/auth), backed by
drizzle over d1 ([`@stormej/db`](../../packages/db)). google oauth + email/password are both enabled;
signup is closed unless `ALLOW_SIGNUP=true`.

## local

```bash
cp .env.example .env
# set BETTER_AUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
cp ../../packages/infra/.env.example ../../packages/infra/.env   # ALCHEMY_PASSWORD
bun run dev:server                    # from repo root — alchemy dev on :8787
```

d1 migrations from [`packages/db/src/migrations`](../../packages/db/src/migrations) apply when
alchemy starts.

google redirect uris must hit the **site** origin (next rewrites `/api/auth/*`):

- `http://localhost:3000/api/auth/callback/google`
- `https://www.stormej.me/api/auth/callback/google`

## deploying

infra lives in [`packages/infra/alchemy.run.ts`](../../packages/infra/alchemy.run.ts). it adopts the
existing `stormej` worker, `stormej-db` d1 database and `stormej-storage` r2 bucket.

```bash
bun run deploy   # from repo root → alchemy deploy
```

prod sets `BETTER_AUTH_URL=https://www.stormej.me` and cors for the site origins so next rewrites
keep auth cookies first-party. secrets (`BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_SECRET`) come from
`apps/server/.env` via `alchemy.secret.env`.

to seed the first google admin: set `ALLOW_SIGNUP=true`, deploy, sign in once at `/vault`, then
remove `ALLOW_SIGNUP` and redeploy.
