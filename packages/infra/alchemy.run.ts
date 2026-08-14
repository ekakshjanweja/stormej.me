import alchemy from "alchemy";
import {
	D1Database,
	DurableObjectNamespace,
	R2Bucket,
	Worker,
} from "alchemy/cloudflare";
import { config } from "dotenv";

config({ path: "./.env" });
config({ path: "../../apps/server/.env" });

const app = await alchemy("stormej");

const PROD_WEB_ORIGIN = "https://www.stormej.me";
const PROD_CORS_ORIGIN = "https://www.stormej.me,https://stormej.me";

const authUrl = app.local
	? alchemy.env("BETTER_AUTH_URL", "http://localhost:3000")
	: alchemy.env("BETTER_AUTH_URL", PROD_WEB_ORIGIN);
const corsOrigin = app.local
	? alchemy.env("CORS_ORIGIN", "http://localhost:3000,http://localhost:8787")
	: alchemy.env("CORS_ORIGIN", PROD_CORS_ORIGIN);

const db = await D1Database("database", {
	adopt: true,
	delete: false,
	migrationsDir: "../../packages/db/src/migrations",
	name: "stormej-db",
});

const storage = await R2Bucket("storage", {
	adopt: true,
	delete: false,
	name: "stormej-storage",
});

const realtime = DurableObjectNamespace("realtime", {
	className: "RealtimeRoom",
	sqlite: true,
});

const allowSignup = process.env.ALLOW_SIGNUP;

export const server = await Worker("server", {
	adopt: true,
	bindings: {
		...(allowSignup ? { ALLOW_SIGNUP: allowSignup } : {}),
		BETTER_AUTH_SECRET: alchemy.secret.env("BETTER_AUTH_SECRET"),
		BETTER_AUTH_URL: authUrl,
		CORS_ORIGIN: corsOrigin,
		DB: db,
		GOOGLE_CLIENT_ID: alchemy.env("GOOGLE_CLIENT_ID"),
		GOOGLE_CLIENT_SECRET: alchemy.secret.env("GOOGLE_CLIENT_SECRET"),
		REALTIME_ROOM: realtime,
		STORAGE_BUCKET: storage,
		VAULT_ACCESS_KEY: alchemy.secret.env("VAULT_ACCESS_KEY"),
	},
	compatibility: "node",
	compatibilityDate: "2025-12-07",
	cwd: "../../apps/server",
	dev: {
		port: 8787,
	},
	entrypoint: "src/index.ts",
	name: "stormej",
	url: true,
});

console.log(`Server -> ${server.url}`);

await app.finalize();
