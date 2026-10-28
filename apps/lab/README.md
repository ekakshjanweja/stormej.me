# lab

Portfolio experiments, kept apart from `apps/web` so any of them can be
merged or deleted without touching the main site. Live at
`stormej.me/experiments/<experiment>/<page>`.

```sh
bun run dev:lab   # from the repo root, serves http://localhost:3001/experiments/lab
```

| experiment | after                                 | pages                                            | status   |
| ---------- | ------------------------------------- | ------------------------------------------------ | -------- |
| `strip`    | [douglus.site](https://douglus.site/) | home, about (work, writing, contact are stormej.me's) | live     |
| `orbit`    | [avivashishta.com](https://www.avivashishta.com/) | home, work, build, write, about, contact | archived |
| `studio`   | [incredibles.dev](https://incredibles.dev/) | home, work, writing, about, privacy        | archived |

Routes: `/experiments/lab` is the index (strip, plus orbit and studio listed
as archived with no links) and `/experiments/strip/*` is strip.
`/experiments` itself stays the main site's loader lab, whose menu links to
strip and the index; the main site's footer links to the index too.

strip keeps only its home and about. Its nav sends work, writing and contact
to stormej.me's own pages (`/work`, `/blog`, the cal.com link), and the old
strip urls for them (`/strip/work`, `/strip/work/<slug>`, `/strip/blog`,
`/strip/contact` and friends) redirect there. Old links to `/orbit` and
`/studio` redirect to `/strip`. All of it lives in `next.config.ts`.

## archive

orbit and studio are kept, untouched, in `archive/orbit` and
`archive/studio`, outside `app/` so Next doesn't route them. They still
type-check; Biome skips them. `archive/README.md` says how to bring one back.

## layout

- Each experiment is a route group with its own root layout (`app/(strip)`;
  the index is `app/(home)`), so moving between them is a full page load and
  no styles leak across. Move a folder to `archive/` and the experiment is
  gone from the site.
- `lib/profile.ts` holds the shared facts: work, projects, writing, the
  stormej.studio reels, links. `lib/cases.ts` holds the long form of each job
  and project, condensed from `apps/web/content`. Links point back at
  www.stormej.me.
- `lib/base.ts` is the one rule for urls: the app runs under the `/experiments`
  base path, so plain `<a>`, `<img>`, `<video>` and `next/image` urls go
  through `withBase()`. `next/link` and the router add it themselves. Media
  paths in `lib/profile.ts` and `lib/cases.ts` already include it.
- `lib/fonts.ts` loads the same three faces as stormej.me.
- `public/media` has resized screenshots, clips, reels and instagram covers.
- each experiment carries its own gsap/lenis setup and webgl fluid in its
  `_lib` folder, on purpose: no experiment imports from another.
  `lib/motion.ts` is only used by the archived orbit.

Every experiment honours `prefers-reduced-motion`, works by keyboard, and
keeps real text in the page for anything drawn on a canvas.

Strip's local images show an inline 24px preview, then fade in a responsive
image after decoding. The 320px thumbnails in `public/media/strip` have
content hashes and immutable caching; larger displays use the original.
Run `bun run images:strip` from `apps/lab` after replacing or adding media
to regenerate the thumbnails and `lib/strip-images.json`. Commit both.
The static files avoid the image optimizer endpoint, which isn't routed by
the Vercel services setup.

## sound effects

Strip plays interface sounds: clicks, hovers, things growing, the curtain
between pages, the drag reel and scrolling. They're on unless someone
switches them off with the header's `sfx` switch (the arrow beside it opens a
volume slider); the choice is remembered. Browsers only allow sound after a
first click or key. Reduced motion starts muted, with an explicit opt-in.

Taps, activated links, opening/closing panels, and successful clipboard copies
have short procedural cues. Scrolling into a new section adds a quieter brush,
including Strip's sideways panels.
Scroll cues have an 800ms cooldown, stay silent with reduced motion, and never
unlock audio on their own. Hover, typing, and moving keyboard focus stay silent.
SFX yield to audible reels and stop when the tab is hidden.
`components/sfx.tsx` owns the controls and interaction listeners; `lib/sfx.ts`
synthesizes the sounds with one lazy Web Audio context and no audio downloads.
Use `data-sfx="silent"` to opt a control out, `data-sfx="open"` or
`data-sfx="close"` for a panel trigger, and `playSfx("success")` only after an
action succeeds alongside its visual confirmation.

## github activity

The contributions count in Strip's "at a glance" section is an activity
calendar. Drag or swipe the calendar through every available year, or use
the arrows and year buttons. Focus a day and use the arrow keys to inspect
its neighbors; Home and End jump to the year's first and latest available
day. Reduced motion removes the count and movement animations.

`/experiments/api/github-activity` uses the same public GitHub Contributions
API as the main site, caches the history for an hour, and sends compact
daily counts and intensity levels. The browser requests it only as the
section approaches the viewport. An unavailable API shows a retry control.

## spotify

Strip shows what's playing (or what played last) and the month's top
tracks. The backend does the work: the stormej Cloudflare worker
(`apps/server`, `src/routes/spotify`) holds the secrets, asks Spotify and
edge-caches the answer for 30 seconds. The lab reaches it at
`/experiments/api/spotify` through a rewrite in `next.config.ts` (to
`NEXT_PUBLIC_WORKER_URL`, else the workers.dev url), and `lib/use-spotify.ts`
polls that. With no credentials the worker answers `configured: false` and
the player stays out of the page. To switch it on:

1. Put `SPOTIFY_CLIENT_SECRET=…` in `apps/server/.env` (dashboard → app
   "portfolio" → settings).
2. `bun run spotify:token` from `apps/lab` (port 3000 must be free), then
   approve in the browser. The refresh token is appended to
   `apps/server/.env`.
3. `bun run deploy` from the repo root. Alchemy ships both to the worker as
   secrets; nothing goes to Vercel.

The refresh token lasts 180 days (the app's setting); remove the old line
and run step 2 again when it runs out. In dev the rewrite points at the
local worker (`bun run dev:server`), and `?spotify=demo` on any page shows
the player with fake data without a backend.

## deploy

The root `vercel.json` runs this app as a second Vercel service: requests to
`/experiments/*` go to `lab`, everything else to `web`. It ships with the
main site on every push to `main`.
