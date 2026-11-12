import { defineConfig, devices } from "@playwright/test";

/* the lab on every kind of screen. strip opens anywhere: sideways on a
   desktop that welcomes motion, stacked everywhere else. the lab's index
   only opens on a desktop, and sends everything else to the portfolio with
   a note saying why. each screen's `metadata.gate` is the note the index
   should give, or "none" if it opens; `metadata.sideways` says whether
   strip runs sideways there. every profile runs in chromium, which emulates its
   size, touch and pointer; set STRIP_URL to test a deployment instead of
   the dev server */

const BASE_URL = process.env.STRIP_URL ?? "http://localhost:3001";

export type Gate = "none" | "touch" | "window";

const chromium = (device: (typeof devices)[string]) => ({
	...device,
	browserName: "chromium" as const,
	defaultBrowserType: "chromium" as const,
});

const screen = (name: string, gate: Gate, use: object, sideways = false) => ({
	metadata: { gate, sideways },
	name,
	use,
});

export default defineConfig({
	expect: { timeout: 15_000 },
	fullyParallel: true,
	outputDir: "test-results",
	projects: [
		/* desktops: strip runs sideways */
		screen("desktop", "none", { viewport: { height: 900, width: 1440 } }, true),
		screen(
			"desktop-small",
			"none",
			{ viewport: { height: 600, width: 1200 } },
			true
		),
		/* desktop windows too small to stand the panels up */
		screen("desktop-narrow", "window", {
			viewport: { height: 800, width: 1100 },
		}),
		screen("desktop-short", "window", {
			viewport: { height: 560, width: 1440 },
		}),
		/* a desktop, but asking for less motion: strip stacks and keeps still */
		screen("desktop-reduced-motion", "none", {
			reducedMotion: "reduce",
			viewport: { height: 900, width: 1440 },
		}),
		/* phones, tablets and a touch-only tablet pc, even the wide ones: strip
		   stacks, the index sends them on */
		screen("iphone-se", "touch", chromium(devices["iPhone SE"])),
		screen("iphone-15", "touch", chromium(devices["iPhone 15"])),
		screen(
			"iphone-15-landscape",
			"touch",
			chromium(devices["iPhone 15 landscape"])
		),
		screen("pixel-7", "touch", chromium(devices["Pixel 7"])),
		screen("galaxy-s24", "touch", chromium(devices["Galaxy S24"])),
		screen("ipad-mini", "touch", chromium(devices["iPad Mini"])),
		screen(
			"ipad-pro-landscape",
			"touch",
			chromium(devices["iPad Pro 11 landscape"])
		),
		screen("tablet-pc", "touch", {
			hasTouch: true,
			viewport: { height: 912, width: 1368 },
		}),
	],
	reporter: [["list"], ["html", { open: "never" }]],
	retries: process.env.CI ? 1 : 0,
	testDir: "tests",
	timeout: 120_000,
	use: { baseURL: BASE_URL, trace: "retain-on-failure" },
	webServer: process.env.STRIP_URL
		? undefined
		: {
				command: "bun run dev",
				reuseExistingServer: true,
				timeout: 120_000,
				url: `${BASE_URL}/experiments/strip`,
			},
});
