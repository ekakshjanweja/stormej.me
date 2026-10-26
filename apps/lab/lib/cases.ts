/* the long form of each job and project, condensed from the mdx in
   apps/web/content. every experiment renders these as its detail pages,
   each in its own design */

import { withBase } from "./base";
import { PROJECTS, WORK } from "./profile";

export interface Chapter {
	/** short, for a table of contents */
	label: string;
	paragraphs: string[];
	title: string;
}

export interface Outcome {
	label: string;
	metric: string;
}

export interface CaseLink {
	href: string;
	label: string;
}

export interface Case {
	/** the problem in one line */
	challenge: string;
	chapters: Chapter[];
	/** screenshots in reading order */
	gallery: string[];
	/** what shape the screenshots are */
	galleryShape: "phone" | "wide";
	kind: "work" | "project";
	links: CaseLink[];
	outcomes: Outcome[];
	/** "founding engineer", "mac app" */
	role: string;
	slug: string;
	/** the link on stormej.me, for the full write-up */
	source: string;
	/** the subtitle on stormej.me */
	subtitle: string;
	tech: string[];
	title: string;
	tldr: string[];
	/** "2024 → 2026", "2026" */
	when: string;
}

const media = (slug: string, names: string[]) =>
	names.map((name) => withBase(`/media/cases/${slug}/${name}.webp`));

const job = (slug: string) => {
	const found = WORK.find((item) => item.slug === slug);
	if (!found) {
		throw new Error(`no job called ${slug} in lib/profile.ts`);
	}
	return found;
};

const project = (slug: string) => {
	const found = PROJECTS.find((item) => item.slug === slug);
	if (!found) {
		throw new Error(`no project called ${slug} in lib/profile.ts`);
	}
	return found;
};

const span = (start: string, end: string | null) =>
	`${start.slice(0, 4)} → ${end ? end.slice(0, 4) : "now"}`;

const workCase = (
	slug: string,
	rest: Omit<
		Case,
		"kind" | "role" | "slug" | "source" | "tech" | "title" | "when"
	>
): Case => {
	const item = job(slug);
	return {
		...rest,
		kind: "work",
		role: item.role,
		slug,
		source: item.href,
		tech: item.tech,
		title: item.company,
		when: span(item.start, item.end),
	};
};

const projectCase = (
	slug: string,
	role: string,
	rest: Omit<
		Case,
		"kind" | "role" | "slug" | "source" | "tech" | "title" | "when"
	>
): Case => {
	const item = project(slug);
	return {
		...rest,
		kind: "project",
		role,
		slug,
		source: item.href,
		tech: item.stack,
		title: item.title,
		when: String(item.year),
	};
};

export const CASES: Case[] = [
	workCase("bullzeye", {
		challenge:
			"turn iphone lidar scans into geometry an app can trust. depth is noisy, alignment drifts, and a wrong surface is worse than none.",
		chapters: [
			{
				label: "starting point",
				paragraphs: [
					"spatial capture and geometry on iphone for physical-world apps. the phone scans, and the output has to be good enough to drive real decisions.",
					"so every stage answers one question: is this scan good enough to use.",
				],
				title: "capture you can build on",
			},
			{
				label: "capture confidence",
				paragraphs: [
					"lidar depth is noisy, meshes drift, coverage has holes. so confidence is an output: depth and mesh agreement gets checked, coverage gets measured, and weak captures get flagged instead of passing through quietly.",
					"nothing downstream should have to guess whether the geometry is trustworthy.",
				],
				title: "evidence first, output second",
			},
			{
				label: "geometry on device",
				paragraphs: [
					"then the question is what to compute on the surface. fitting through noisy real-world data means reasoning about risk, not just best fit, and keeping the heavy work on device so it stays fast and private.",
				],
				title: "geometry that respects uncertainty",
			},
		],
		gallery: [],
		galleryShape: "phone",
		links: [{ href: "https://bullzeyegolf.com/", label: "bullzeye" }],
		outcomes: [
			{ label: "on iphone", metric: "lidar" },
			{ label: "output gated on", metric: "confidence" },
			{ label: "processing", metric: "on device" },
		],
		subtitle: "capture, geometry, and confidence for physical-world apps",
		tldr: [
			"spatial capture on iphone lidar",
			"depth and mesh aligned into usable surfaces",
			"output gated on capture confidence",
			"geometry picked for risk, not just fit",
			"processing kept on device",
		],
	}),
	workCase("fpv-labs", {
		challenge:
			"make phone capture reliable enough for robotics data: big files, long recordings, and devices that don't behave.",
		chapters: [
			{
				label: "starting point",
				paragraphs: [
					"joined in nov 2025 as a mobile engineer. the phone sat in the middle of a robotics data workflow: record the world, move big datasets, and keep going when devices, sensors and networks misbehave.",
					"so a flow was only done when it survived the field, not the simulator.",
				],
				title: "joining fpv labs",
			},
			{
				label: "stability",
				paragraphs: [
					"some modules pushed the crash rate toward ~6%, which is not ok when the app is the recorder. i refactored the shaky parts and tightened error handling on ios and android, and got it under 1%.",
				],
				title: "stability first, then speed",
			},
			{
				label: "uploads",
				paragraphs: [
					"capture sessions get heavy fast. i built a cross-platform upload pipeline for 10gb+ files: resumable, running in the background, recovering from failure. an interrupted upload picks up where it stopped instead of starting from zero.",
				],
				title: "large uploads that actually finish",
			},
			{
				label: "capture",
				paragraphs: [
					"the ar capture system runs on arkit and arcore and records video, pose, point cloud, depth and imu from one session.",
					"sessions are packaged as mcap datasets compatible with ros2, sampled at roughly 30 fps, so the output is usable for robotics work, not just raw sensor noise.",
				],
				title: "from ar session to dataset",
			},
			{
				label: "privacy",
				paragraphs: [
					"recordings happen in public, so every session is anonymized on device before upload. faces get pixelated in every rgb frame and in the thumbnail.",
					"it isn't a setting. no upload row can exist without the blur marker on disk, enforced in the one function that creates uploads and every recovery path around it.",
				],
				title: "faces never leave the phone",
			},
			{
				label: "hand pose",
				paragraphs: [
					"vision detects 21 joint skeletons and we lift them into 3d with the recording's own depth. it runs after capture, so it never blocks an upload.",
					"buffering ~1 kb a frame keeps twenty minutes of footage at ~12 mb instead of ~236 mb, the difference between working and getting killed by the os.",
				],
				title: "21 joints, lifted through depth",
			},
			{
				label: "two phones",
				paragraphs: [
					"one camera sees one side of a task. two phones fix that, until you ask what a timestamp means across two devices.",
					"ios has no shared clock, so the phones run a ping/pong protocol into a kalman filter over offset and drift. offline, one command remaps the follower onto the leader's timeline and merges both into one mcap. the target is 1-2 ms.",
				],
				title: "two phones, one timeline",
			},
		],
		gallery: media("fpv-labs", [
			"fpv_one",
			"fpv_two",
			"fpv_five",
			"fpv_four",
			"fpv_six",
			"fpv_seven",
			"fpv_three",
			"fpv_eight",
		]),
		galleryShape: "phone",
		links: [
			{ href: "https://www.fpvlabs.ai/", label: "fpv labs" },
			{
				href: "https://www.fpvlabs.ai/essays/stera-capture-app",
				label: "the essay",
			},
			{ href: "https://github.com/fpv-labs/stera-app", label: "stera capture" },
			{
				href: "https://pub.dev/packages/stera_recorder",
				label: "stera_recorder",
			},
			{
				href: "https://huggingface.co/datasets/fpvlabs/stera-10m",
				label: "stera-10m dataset",
			},
		],
		outcomes: [
			{ label: "resumable uploads", metric: "10gb+" },
			{ label: "ar capture into mcap", metric: "30 fps" },
			{ label: "crash rate, from ~6%", metric: "under 1%" },
			{ label: "two device alignment", metric: "1-2 ms" },
		],
		subtitle: "remote mobile systems for data capture",
		tldr: [
			"resumable uploads for 10gb+ capture sessions",
			"arkit / arcore capture into mcap · ros2 datasets",
			"every recording anonymized on device before upload",
			"21 joint hand pose lifted through depth",
			"two phones synced to one timeline",
			"open-sourced the stera capture stack",
		],
	}),
	workCase("digital-domi", {
		challenge:
			"build a mobile mailbox from scratch on a small team, with consumer-grade polish.",
		chapters: [
			{
				label: "starting point",
				paragraphs: [
					"joined in late 2024 as the first mobile hire. no app yet: a small team, a web product, and the question of what a mobile mailbox should feel like.",
					"we picked flutter, one codebase for ios, android and web.",
				],
				title: "founding mobile at digital domi",
			},
			{
				label: "architecture",
				paragraphs: [
					"mvc-style, with providers and value notifiers. most state is ephemeral: the screen owns it and disposes it, nothing global unless it has to be. fewer rebuilds, fewer cross-screen bugs, easier onboarding.",
				],
				title: "keeping state where it belongs",
			},
			{
				label: "shipping",
				paragraphs: [
					"the core is the mailbox: physical mail rendered digitally, media you can share, ad campaigns you can act on. i built the upload flow, the viewer, the share sheet and the edge cases.",
					"the flutter web build ships from the same codebase, deployed to s3 by github actions on every merge to main.",
				],
				title: "a mailbox you actually want to open",
			},
			{
				label: "system",
				paragraphs: [
					"as it grew, the components moved into one design system shared by mobile and web. same primitives, same tokens, so the platforms don't drift apart.",
				],
				title: "one design language across surfaces",
			},
		],
		gallery: media("digital-domi", [
			"domi_one",
			"domi_two",
			"domi_three",
			"domi_four",
			"domi_five",
			"domi_six",
			"domi_seven",
		]),
		galleryShape: "phone",
		links: [
			{ href: "https://digitaldomi.com/", label: "digital domi" },
			{
				href: "https://apps.apple.com/us/app/digital-domi/id6738277048",
				label: "app store",
			},
			{
				href: "https://play.google.com/store/apps/details?id=com.domilabs.domi",
				label: "play store",
			},
		],
		outcomes: [
			{ label: "live on", metric: "ios + android + web" },
			{ label: "ci/cd", metric: "github actions → s3" },
		],
		subtitle: "digital mailboxes",
		tldr: [
			"first mobile hire",
			"one flutter codebase for ios, android and web",
			"the mailbox, the viewer, the share sheet",
			"a design system shared across surfaces",
		],
	}),
	workCase("merlin", {
		challenge:
			"ship native android features and a new ai image-gen app on merlin's flutter codebase, without slowing the team down.",
		chapters: [
			{
				label: "context",
				paragraphs: [
					"merlin was already shipping fast: a flutter app on multiple ai backends, on ios and android. my job was to push it outward with native android touchpoints, sharper ux, and a second app under the same brand.",
				],
				title: "joining a fast-moving consumer ai app",
			},
			{
				label: "android",
				paragraphs: [
					"i added home-screen widgets with jetpack glance, app shortcuts and share-sheet intents, so merlin could be opened from anywhere on the system. push notifications now open the right thread instead of the home screen.",
				],
				title: "widgets, shortcuts, and intents",
			},
			{
				label: "platform",
				paragraphs: [
					"every feature was rewriting api calls, so i built a dart client library with auth, retries and typed responses. plus http streaming for chat and config caching to cut cold starts on bad networks.",
				],
				title: "a dart client for the backend",
			},
			{
				label: "wallflower",
				paragraphs: [
					"i led wallflower end to end: a standalone ai image-gen app on flux 1.1 pro and ideogram 2.0. generation, prompt ux, gallery and sharing. it shipped on both stores and reuses merlin's components, so the brand feels continuous.",
				],
				title: "a second app, same dna",
			},
		],
		gallery: media("merlin", [
			"merlin_two",
			"merlin_three",
			"merlin_six",
			"merlin_five",
			"wallflower_three",
			"wallflower_four",
			"merlin_four",
			"merlin_seven",
		]),
		galleryShape: "phone",
		links: [
			{ href: "https://www.getmerlin.in/", label: "merlin" },
			{
				href: "https://play.google.com/store/apps/details?id=com.foyer.wallflower",
				label: "wallflower",
			},
		],
		outcomes: [
			{ label: "shipped on ios + android", metric: "2 apps" },
			{ label: "android home-screen widgets", metric: "jetpack glance" },
			{ label: "image-gen models in prod", metric: "flux + ideogram" },
		],
		subtitle: "flutter, ai, and pushing the limits",
		tldr: [
			"jetpack glance widgets, shortcuts and intents",
			"a typed dart client for the backend",
			"led wallflower, an ai image-gen app, end to end",
		],
	}),
	workCase("team-black-box", {
		challenge:
			"ship features across three small react native apps: custom ui, nlp parsing and map geometry.",
		chapters: [
			{
				label: "internship",
				paragraphs: [
					"a six-month internship across three apps: take a sip, i won't forget and land blocks. react native, firebase and zustand. my first time designing custom ui and using skia.",
				],
				title: "three products, one six-month run",
			},
			{
				label: "ui",
				paragraphs: [
					"on take a sip i built the custom sips flow end to end on firebase, plus in-app markdown changelogs so release notes live in the product instead of an email.",
				],
				title: "custom sips and in-app changelogs",
			},
			{
				label: "nlp",
				paragraphs: [
					"for i won't forget i used compromise.cool to pull reminder details out of free text. tuning the parser improved accuracy by ~30% on our test set, with unit tests around the extraction paths so refactors couldn't quietly break it.",
				],
				title: "parsing reminders from natural language",
			},
			{
				label: "maps",
				paragraphs: [
					"on land blocks i drew land plots as polygons on the map with react-native-skia.",
				],
				title: "land plots with react-native-skia",
			},
		],
		gallery: [],
		galleryShape: "phone",
		links: [
			{ href: "https://teamblackbox.in/", label: "team black box" },
			{ href: "https://takeasip.app/", label: "take a sip" },
			{ href: "https://iwontforget.app/", label: "i won't forget" },
		],
		outcomes: [
			{ label: "features shipped", metric: "3 apps" },
			{ label: "reminder parsing accuracy", metric: "~30% gain" },
		],
		subtitle: "ui, nlp, and polygons ftw",
		tldr: [
			"custom sips and markdown changelogs",
			"natural-language reminder parsing, ~30% more accurate",
			"land plots drawn with skia",
		],
	}),
	workCase("zuai", {
		challenge:
			"first internship, first real codebase. ship features without breaking a flutter app with 500k+ users.",
		chapters: [
			{
				label: "first job",
				paragraphs: [
					"my first internship. i'd written flutter on my own but never in a team codebase, so day one was branches, prs and code review. and the app was already live.",
				],
				title: "showing up barely knowing github",
			},
			{
				label: "shipping",
				paragraphs: [
					"i built parts of onboarding and the dashboard: small screens every new user hits, so loading, empty and error states mattered as much as the happy path. for 500k+ users on patchy networks, riverpod for state and dio with retries and timeouts.",
				],
				title: "onboarding and dashboard at scale",
			},
			{
				label: "polish",
				paragraphs: [
					"i added dark mode to the screens i owned, plus spacing, type and hit-target fixes. that's where i learned shipping a ticket isn't the same as finishing it.",
				],
				title: "dark mode and the small stuff",
			},
		],
		gallery: media("zuai", ["zuai_two", "zuai_three", "zuai_one"]),
		galleryShape: "phone",
		links: [
			{ href: "https://www.zuai.co/", label: "professor curious" },
			{
				href: "https://apps.apple.com/in/app/professor-curious-ai-tutor/id1609941536",
				label: "app store",
			},
		],
		outcomes: [
			{ label: "scale at the time", metric: "500k+ users" },
			{ label: "my first real release", metric: "first prod ship" },
		],
		subtitle: "my first step into the dev world",
		tldr: [
			"onboarding and dashboard screens",
			"riverpod, dio, retries and timeouts",
			"dark mode and polish",
		],
	}),
	projectCase("lumen", "mobile app", {
		challenge:
			"the app that ships with my rgb light couldn't even find it. so i reverse engineered its bluetooth protocol and built my own remote.",
		chapters: [
			{
				label: "pairing",
				paragraphs: [
					"the light doesn't advertise at all. it listens for broadcast adverts on its channel (100 by default) and does whatever they say. so lumen never really connects to it. it broadcasts.",
					'finding it works the same way. lumen makes the light blink and asks if you saw it. if the light was moved off its default channel, lumen walks every channel and group until you tap "it turned red".',
				],
				title: "pairing without connecting",
			},
			{
				label: "protocol",
				paragraphs: [
					"each setting goes out as a 23-byte ibeacon-shaped advert: the channel in the uuid, group, effect and saturation packed into major, hue or color temperature in minor, brightness in power.",
					"android sends it as manufacturer data, from kotlin. ios doesn't let apps send custom manufacturer data, so it goes out as a real ibeacon, from swift. the light follows both.",
					'the stock app addresses "all groups" as 255 in one place. send that and white and most effects break. the value that actually works is 7.',
				],
				title: "the protocol",
			},
			{
				label: "features",
				paragraphs: [
					"white from 2500 k to 9900 k, a color pad with saved colors, all 24 effects, and a brightness pill like the ios flashlight with a haptic tick every 10%.",
					"it remembers your light and its last setting. no accounts, no analytics, no network requests.",
				],
				title: "what it does",
			},
		],
		gallery: media("lumen", ["search", "white", "color", "effects", "presets"]),
		galleryShape: "phone",
		links: [
			{ href: "https://github.com/ekakshjanweja/lumen", label: "github" },
		],
		outcomes: [
			{ label: "effects", metric: "24" },
			{ label: "advert per setting", metric: "23 bytes" },
			{ label: "network requests", metric: "0" },
		],
		subtitle: "a better remote for bluetooth led lights",
		tldr: [
			"reverse engineered the light's bluetooth protocol",
			"broadcasts instead of connecting",
			"kotlin on android, swift on ios, flutter on top",
		],
	}),
	projectCase("burrow", "mac app", {
		challenge:
			"my mac holds everything. i wanted one place to see what's eating the disk, clear it safely, and push the important stuff to the homelab.",
		chapters: [
			{
				label: "overview",
				paragraphs: [
					"burrow is a tiny native control center for my mac and the arch linux homelab next to it. swift and swiftui, no webview, no server, no bundled runtime. the whole app is 3 mb.",
					'one headline like "storage is getting full, you can probably clear 32 gb", then numbered suggestions with one action each.',
				],
				title: "a tiny control center",
			},
			{
				label: "cleanup",
				paragraphs: [
					"a cached map of downloads, projects, xcode, simulators, caches and containers. cleanup runs through mole and won't run without a fresh preview.",
				],
				title: "storage and cleanup",
			},
			{
				label: "backups",
				paragraphs: [
					"hosts come from ~/.ssh/config. every transfer is staged, sha-256 verified, then moved in without overwriting anything. bring back works the same way in reverse.",
				],
				title: "backups over ssh",
			},
			{
				label: "barely there",
				paragraphs: [
					"two processes. an appkit menu bar agent is the only thing always running, and the window app quits when you close it.",
					"nothing samples unless a view is watching, commands wait on exit events instead of polling, and the storage map walks at most once a day.",
				],
				title: "barely there",
			},
		],
		gallery: media("burrow", [
			"overview",
			"cleanup",
			"backups",
			"system",
			"aerospace",
			"history",
		]),
		galleryShape: "wide",
		links: [{ href: "https://burrow.ekaksh.in", label: "burrow.ekaksh.in" }],
		outcomes: [
			{ label: "the whole app", metric: "3 mb" },
			{ label: "menu bar agent in memory", metric: "~10 mb" },
			{ label: "per 10 min, window closed", metric: "0.03 cpu-s" },
		],
		subtitle: "tiny native mac app for developers",
		tldr: [
			"storage, cleanup and backups in one menu bar app",
			"swift and swiftui, no webview",
			"sha-256 verified transfers to a homelab over ssh",
		],
	}),
	projectCase("aarthiqai", "web app", {
		challenge:
			"a home loan is months of discovery, documents, verification and follow-ups. make that chain feel like one calm conversation.",
		chapters: [
			{
				label: "what i built",
				paragraphs: [
					"the customer app is two screens, chat and loans, because the ai is the interface.",
					"lender policy is compiled into a typescript policy tree; the model reads a compact index and pulls only the nodes it needs. a case agent researches employer and rera registries, runs deterministic loan math and renders a pdf case report.",
				],
				title: "the ai is the interface",
			},
			{
				label: "voice",
				paragraphs: [
					"pipecat over livekit webrtc: silero vad and smart turn for endpointing, muse for stt, qwen on cerebras for the spoken loop, rumik silk for tts.",
					'the hard part is turn-taking. silence can\'t tell "eighty lakh" (done) from "two point" (not done), so every reply is marked finished, cut off or still thinking, and only finished ends the turn.',
				],
				title: "the voice agent",
			},
			{
				label: "learning",
				paragraphs: [
					"rated conversations become operator lessons, and approved cases become a rag corpus with holdout evals. the product only ever claims readiness, never approval.",
				],
				title: "a loop that learns",
			},
		],
		gallery: [withBase("/media/aarthiq.webp")],
		galleryShape: "wide",
		links: [{ href: "https://aarthiqai.com", label: "aarthiqai.com" }],
		outcomes: [
			{ label: "one conversation", metric: "chat + voice" },
			{ label: "eligibility to close", metric: "discovery → dsa" },
			{ label: "in production", metric: "live" },
		],
		subtitle: "conversational home-loan planner for india",
		tldr: [
			"chat and voice into one case file",
			"compiled lender policy, no vector db",
			"pipecat voice agent with careful turn-taking",
		],
	}),
	projectCase("turi", "email client", {
		challenge:
			"read and answer email by talking to it. the model gets gmail tools, and every reply streams back as text and audio.",
		chapters: [
			{
				label: "agent",
				paragraphs: [
					"a flutter app on the phone, bun and hono on cloudflare workers behind it.",
					"every turn checks if you're done. if not, the model runs with gmail tools to read, search and send, then the reply streams back as text and audio in parallel.",
				],
				title: "the agent workflow",
			},
			{
				label: "voice",
				paragraphs: [
					"speech gets cut on the phone before upload. it starts above -30 db, stops below -40 db, checked every 100 ms, then gets transcribed and streamed back.",
				],
				title: "voice activity detection",
			},
		],
		gallery: media("turi", ["agent-workflow", "vad"]),
		galleryShape: "phone",
		links: [
			{ href: "https://turi.ekaksh.in/", label: "turi.ekaksh.in" },
			{ href: "https://github.com/ekakshjanweja/turi", label: "github" },
		],
		outcomes: [
			{ label: "speech starts above", metric: "-30 db" },
			{ label: "replies as", metric: "text + audio" },
		],
		subtitle: "ai powered email client",
		tldr: [
			"voice-first email on flutter",
			"gmail tools on cloudflare workers",
			"on-device voice activity detection",
		],
	}),
	projectCase("better-auth-flutter", "flutter package", {
		challenge:
			"better-auth had no flutter client, so flutter apps couldn't share auth with a better-auth backend.",
		chapters: [
			{
				label: "package",
				paragraphs: [
					"an open-source flutter client for better-auth, published on pub.dev, so a flutter app can sign in against the same backend as the web.",
				],
				title: "the flutter client for better-auth",
			},
		],
		gallery: [],
		galleryShape: "phone",
		links: [
			{
				href: "https://pub.dev/packages/better_auth_flutter",
				label: "pub.dev",
			},
			{
				href: "https://github.com/ekakshjanweja/better_auth_flutter",
				label: "github",
			},
		],
		outcomes: [{ label: "on pub.dev", metric: "open source" }],
		subtitle: "flutter client for better-auth",
		tldr: ["a better-auth client for flutter", "open source, on pub.dev"],
	}),
];

export const caseFor = (slug: string) =>
	CASES.find((item) => item.slug === slug);

export const WORK_CASES = CASES.filter((item) => item.kind === "work");
export const PROJECT_CASES = CASES.filter((item) => item.kind === "project");

/** the case after this one, wrapping, within the same kind */
export const nextCase = (slug: string) => {
	const current = caseFor(slug);
	if (!current) {
		return;
	}
	const list = current.kind === "work" ? WORK_CASES : PROJECT_CASES;
	const index = list.indexOf(current);
	return list[(index + 1) % list.length];
};
