# archive

Experiments that were tried and set aside. They sit outside `app/`, so Next
doesn't route them, but every file is intact. They still type-check with the
rest of the app (`bun x tsc --noEmit`); Biome skips this folder (see the root
`biome.json`).

| folder   | what it was                                                                                         | after                                             | pages                                                               |
| -------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------- |
| `orbit`  | one screen, no scroll: a ring of everything shipped, hung in a drawn delhi sky                      | [avivashishta.com](https://www.avivashishta.com/) | home, work, work/[slug], build, build/[slug], write, about, contact |
| `studio` | a one-engineer studio page: fluid headline, cards stacked in 3d, a screenshot trail, a bouncing block | [incredibles.dev](https://incredibles.dev/)       | home, work, work/[slug], writing, about, privacy                    |

Each folder is the old route group as it was: `layout.tsx` (its own root
layout) plus the `orbit/` or `studio/` route folder. They still import the
shared `@/lib/*` and `@/components/*` modules (`lib/motion.ts` is only used by
orbit and stays in `lib/` for that reason).

Old links (`/experiments/orbit/*`, `/experiments/studio/*`) redirect to strip.

## restore one

1. Move the folder back under `app/` as a route group:
   `mv archive/orbit "app/(orbit)"` (or `archive/studio` to `app/(studio)`).
2. In `next.config.ts`, delete it from `ARCHIVED` (that removes the redirect
   to strip), add it back to `EXPERIMENTS`, and give it `WRITING` and
   `PROJECTS` entries (orbit: `write` / `build`; studio: `writing` / `work`).
3. In `lib/experiments.ts`, move its entry from `ARCHIVED` to `EXPERIMENTS`
   with `href`, `image` and `pages` (orbit's cover was `/media/lumen.webp`,
   studio's `/media/ig/DeQ1DsrkX1w.webp`).
4. Run `bun x ultracite check apps/lab` from the root and fix what it finds;
   this folder hasn't been linted since it moved.
