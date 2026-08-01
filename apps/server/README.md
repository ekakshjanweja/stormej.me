# server

the hono worker. it serves three things:

- **`/files/*`** — public reads out of the `stormej-storage` r2 bucket
- **`/admin/*`** — vault writes, behind a better-auth session
  ([`src/middleware/require-session.ts`](src/middleware/require-session.ts))
- **`/ws`** — the live-cursor durable object ([`src/durable-objects.ts`](src/durable-objects.ts))

the vault unlocks with `VAULT_ACCESS_KEY` (see `.env.example`). `POST /admin/unlock` checks the
key and sets an HttpOnly `stormej_vault` cookie; other `/admin/*` routes require that cookie
(or a legacy better-auth session).

## local

```bash
cp .env.example .env
# set BETTER_AUTH_SECRET and VAULT_ACCESS_KEY (openssl rand -base64 32)
cp ../../packages/infra/.env.example ../../packages/infra/.env   # ALCHEMY_PASSWORD
bun run dev:server                    # from repo root — alchemy dev on :8787
```

d1 migrations from [`packages/db/src/migrations`](../../packages/db/src/migrations) apply when
alchemy starts.

## deploying

infra lives in [`packages/infra/alchemy.run.ts`](../../packages/infra/alchemy.run.ts). it adopts the
existing `stormej` worker, `stormej-db` d1 database and `stormej-storage` r2 bucket.

```bash
bun run deploy   # from repo root → alchemy deploy
```

prod secrets (`BETTER_AUTH_SECRET`, `VAULT_ACCESS_KEY`, …) come from `apps/server/.env` via
`alchemy.secret.env`.
