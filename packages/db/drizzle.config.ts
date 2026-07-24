import { defineConfig } from "drizzle-kit";

export default defineConfig({
	// DOCS: https://orm.drizzle.team/docs/guides/d1-http-with-drizzle-kit
	dialect: "sqlite",
	driver: "d1-http",
	out: "./src/migrations",
	schema: "./src/schema",
});
