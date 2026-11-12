import { expect, type Page, type TestInfo, test } from "@playwright/test";
import type { Gate } from "../playwright.config";

/* strip opens anywhere: sideways on a desktop that welcomes motion,
   stacked everywhere else. the lab's index only opens on a desktop;
   everywhere else a note says why and links to the portfolio.
   playwright.config.ts lists the screens, the note each should get and
   whether strip runs sideways; a tour attaches a screenshot of every stop */

const STRIP = "/experiments/strip?spotify=demo";
const LAB = "/experiments/lab";
const PORTFOLIO = "https://www.stormej.me";
/* a panel may spill this far past the screen before it counts as cut off */
const TOLERANCE_PX = 2;
/* long enough for the scrub and a reveal to settle after a jump */
const SETTLE_MS = 900;
/* the most stops a tour screenshots */
const MAX_STOPS = 16;
/* lenis marks the page while it runs */
const LENIS_CLASS = /\blenis\b/;

const gateFor = (info: TestInfo) => info.project.metadata.gate as Gate;
const sidewaysFor = (info: TestInfo) =>
	info.project.metadata.sideways as boolean;
const reducedFor = (info: TestInfo) =>
	info.project.use.reducedMotion === "reduce";

const open = async (page: Page, path: string) => {
	/* the preloader only plays on a first visit */
	await page.addInitScript(() => {
		sessionStorage.setItem("strip:preloader-seen", "");
	});
	await page.goto(path);
	await page.evaluate(() => document.fonts.ready);
};

const spillsSideways = (page: Page) =>
	page.evaluate(
		() => document.documentElement.scrollWidth > window.innerWidth + 1
	);

const expectNote = async (page: Page, gate: Exclude<Gate, "none">) => {
	await expect(
		page.getByRole("heading", { name: "made for a desktop" })
	).toBeVisible();
	/* one reason, the right one */
	await expect(page.locator(".desktop-only-why:visible")).toHaveCount(1);
	await expect(page.locator(`p[data-why="${gate}"]`)).toBeVisible();
	const link = page.getByRole("link", { name: "see the portfolio" });
	await expect(link).toBeVisible();
	await expect(link).toHaveAttribute("href", PORTFOLIO);
	await expect(page.locator(".desktop-only-content")).toBeHidden();
	expect(await spillsSideways(page), "the note scrolls sideways").toBe(false);
};

const expectNoNote = async (page: Page) => {
	await expect(page.locator(".desktop-only-gate")).toBeHidden();
	await expect(page.locator(".desktop-only-content")).toBeVisible();
};

/* sideways, the strip is pinned and scrolling slides it along; stacked,
   nothing is pinned and the page scrolls down like any page */
const expectSideways = async (page: Page, sideways: boolean) => {
	const pin = page.locator(".sw .pin-spacer");
	if (sideways) {
		await expect(pin).toBeAttached();
	} else {
		await expect(pin).toHaveCount(0);
	}
};

const trackLeft = (page: Page) =>
	page
		.locator(".sw-track")
		.evaluate((track) => track.getBoundingClientRect().left);

const chromeAway = (page: Page) =>
	page.evaluate(() =>
		document.documentElement.hasAttribute("data-chrome-away")
	);

/* every panel whose visible content runs past the top or bottom of the
   screen. reveals hide things below their masks until they play, so this
   is only fair once the strip has been toured */
const cutOffPanels = (page: Page, tolerance: number) =>
	page.evaluate((limit) => {
		const describe = (element: Element) =>
			[element.tagName.toLowerCase(), ...element.classList].join(".");
		const cut: { by: string; panel: string; px: number }[] = [];
		for (const panel of document.querySelectorAll(".sw-track > *")) {
			const box = panel.getBoundingClientRect();
			if (box.width === 0) {
				continue;
			}
			let worst = 0;
			let by = "";
			for (const element of panel.querySelectorAll("*")) {
				if (element.closest("[aria-hidden='true']")) {
					continue;
				}
				const style = getComputedStyle(element);
				const rect = element.getBoundingClientRect();
				if (
					style.visibility === "hidden" ||
					style.position === "fixed" ||
					rect.width === 0 ||
					rect.height === 0
				) {
					continue;
				}
				const over = Math.max(rect.bottom - box.bottom, box.top - rect.top);
				if (over > worst) {
					worst = over;
					by = describe(element);
				}
			}
			if (worst > limit) {
				cut.push({ by, panel: describe(panel), px: Math.round(worst) });
			}
		}
		return cut;
	}, tolerance);

/* scrolls the length of the page, screenshotting each stop, so every
   reveal has played and there's a picture of every panel to look at */
const tour = async (page: Page, info: TestInfo) => {
	const { max, step } = await page.evaluate(() => ({
		max: document.documentElement.scrollHeight - window.innerHeight,
		/* sideways a screen of scroll is a screen's width along; stacked,
		   a screen's height down */
		step:
			(document.querySelector(".sw .pin-spacer")
				? window.innerWidth
				: window.innerHeight) * 0.8,
	}));
	const stops = Math.min(MAX_STOPS, Math.ceil(max / step) + 1);
	for (let stop = 0; stop < stops; stop += 1) {
		const y = Math.round((max * stop) / Math.max(1, stops - 1));
		// biome-ignore lint/performance/noAwaitInLoops: one stop at a time, in order, each settled before its screenshot
		await page.evaluate((top) => window.scrollTo(0, top), y);
		await page.waitForTimeout(SETTLE_MS);
		await info.attach(`stop-${String(stop).padStart(2, "0")}`, {
			body: await page.screenshot(),
			contentType: "image/png",
		});
	}
	await page.evaluate(() => window.scrollTo(0, 0));
	await page.waitForTimeout(SETTLE_MS);
};

test("strip runs sideways on a desktop, and stacks anywhere else", async ({
	page,
}, info) => {
	await open(page, STRIP);
	await expect(page.locator(".desktop-only-gate")).toHaveCount(0);
	const sideways = sidewaysFor(info);
	await expectSideways(page, sideways);
	/* lenis smooths the page unless motion's been turned down */
	const html = page.locator("html");
	if (reducedFor(info)) {
		await expect(html).not.toHaveClass(LENIS_CLASS);
	} else {
		await expect(html).toHaveClass(LENIS_CLASS);
	}
	expect(await spillsSideways(page), "the page scrolls sideways").toBe(false);

	await page.evaluate(() => window.scrollTo(0, window.innerHeight));
	await page.waitForTimeout(SETTLE_MS);
	if (sideways) {
		/* scrolling down slides the strip along */
		expect(await trackLeft(page)).toBeLessThan(-100);
		return;
	}
	/* scrolling down goes down; the strip stays where it is */
	expect(await trackLeft(page)).toBe(0);
	expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
});

test("stacked, the chrome steps aside going down and comes back going up", async ({
	page,
}, info) => {
	test.skip(sidewaysFor(info), "sideways, the chrome stays put");
	await open(page, STRIP);
	const nav = page.locator(".nav");
	await page.evaluate(() => window.scrollTo(0, 600));
	await page.waitForTimeout(SETTLE_MS);
	await page.evaluate(() => window.scrollTo(0, 1400));
	await page.waitForTimeout(SETTLE_MS);
	expect(await chromeAway(page)).toBe(true);
	expect(
		await nav.evaluate((element) => element.getBoundingClientRect().bottom)
	).toBeLessThanOrEqual(1);

	await page.evaluate(() => window.scrollTo(0, 1200));
	await page.waitForTimeout(SETTLE_MS);
	expect(await chromeAway(page)).toBe(false);
	expect(
		await nav.evaluate((element) => element.getBoundingClientRect().top)
	).toBe(0);
});

test("on touch, nothing on the page holds a swipe", async ({ page }, info) => {
	test.skip(info.project.use.hasTouch !== true, "not a touch screen");
	await open(page, STRIP);
	/* touch-action none would turn a swipe on the reel into a drag */
	const held = await page.evaluate(() =>
		[...document.querySelectorAll("#strip-main *")]
			.filter((element) => getComputedStyle(element).touchAction === "none")
			.map((element) => element.className.toString())
	);
	expect(held).toEqual([]);
	await expect(page.locator(".drag-label")).toBeHidden();
});

test("the lab's index opens on a desktop only", async ({ page }, info) => {
	await open(page, LAB);
	const gate = gateFor(info);
	if (gate !== "none") {
		await expectNote(page, gate);
		return;
	}
	await expectNoNote(page);
	await expect(page.getByRole("heading", { name: "the lab" })).toBeVisible();
});

test("every strip panel fits the screen", async ({ page }, info) => {
	test.skip(!sidewaysFor(info), "strip stacks here");
	await open(page, STRIP);
	await expectSideways(page, true);
	await tour(page, info);
	expect(await cutOffPanels(page, TOLERANCE_PX)).toEqual([]);
});

test("stacked, every stop down the page is screenshotted", async ({
	page,
}, info) => {
	test.skip(sidewaysFor(info), "the sideways tour covers this");
	await open(page, STRIP);
	await tour(page, info);
	expect(await spillsSideways(page), "the page scrolls sideways").toBe(false);
});

test("a window resized past the line swaps sideways and stacked", async ({
	page,
}, info) => {
	test.skip(info.project.name !== "desktop", "one desktop is enough");
	await open(page, STRIP);
	await expectSideways(page, true);

	await page.setViewportSize({ height: 800, width: 1000 });
	await expectSideways(page, false);

	await page.setViewportSize({ height: 900, width: 1440 });
	await expectSideways(page, true);
});

test.describe("before javascript runs", () => {
	test.use({ javaScriptEnabled: false });

	test("the index's note already shows", async ({ page }, info) => {
		const gate = gateFor(info);
		if (gate === "none") {
			test.skip(true, "the index opens here");
			return;
		}
		await page.goto(LAB);
		await expectNote(page, gate);
	});
});
