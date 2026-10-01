# DEVLOG.md — the live devlog

The plain history of this project. A person who knows nothing about the
code reads this file and knows what happened, in order, with no jargon.
Append only. Never rewrite an old entry — a wrong entry gets a
correction entry, not an edit.

Write every entry in the voice of `TONE.md`.

## Entry shape

Every entry has the same shape:

```
## YYYY-MM-DD — <one line: what happened>

<What we did. What worked. What broke. What we learned.
3–10 short sentences. Plain words. Past tense for what happened,
present tense for how things now stand.>

Evidence: <commit / tag / gate run / screenshot>
```

## When to write

- Every WEEKLY.md cycle writes one entry at step 5 (before merge).
- A failed or abandoned attempt gets an entry too. The devlog records
  what happened, not what succeeded. A week with no shipped feature
  still gets its entry.
- Out-of-band work (security patch, gate repair, big triage) gets one.
- SETUP.md writes the first entry: "Installed the agent kit."

## What does not go here

- Code detail that belongs in commit messages.
- Promises about the future — that is ROADMAP.md.
- State claims — that is STATUS.md. The devlog is the story; STATUS is
  the snapshot.

---

<!-- Entries below, newest first. -->

## 2026-10-01 — Added SEO tags, icons and Open Graph images to the docs site

The maintainer asked for full SEO, OG images and icons, and named the
domain: `graphcomp.reagent-systems.com`. The site is a single-page app,
so link previews saw one title for every page. A Vite plugin now writes
one HTML file per route with its own head tags, plus `404.html`,
`sitemap.xml` and `robots.txt`. Unknown paths now get a real 404 status.
`pnpm assets` renders the icons and 13 Open Graph images in Chromium.
Each OG image shows a screenshot of the page's live preview. The first
render cropped the nodes, because the preview frame was wider than the
image slot. The script now sizes the frame to the slot before React Flow
fits the view. The registry URLs moved to the new domain.

Evidence: `pnpm verify` green; `tests/seo.test.ts` 6 tests; `public/og/`.

## 2026-10-01 — Built the docs site

The maintainer asked for a website for the library, like the shadcn/ui
site, hosted on Vercel. I added it to the roadmap as item 1 and built it
in `site/`. The landing page shows the event-flow block as a live canvas
and an install command with a copy button. Every registry item has a page
with a live preview, its highlighted source, its install command, its
props and its keys. The site is now the root page, so the playground
moved to `/playground/` and the E2E suite followed it. React Flow zooms
on the wheel and blocks page scroll, which made long docs pages hard to
read. A capture listener on each preview frame now lets the wheel scroll
the page; pinch still zooms. `vercel.json` serves the site, the
playground and the registry JSON from one deploy.

Evidence: `pnpm verify` green; `e2e/site.spec.ts` 16 tests; `verify/artifacts/site-home.png`.

## 2026-09-23 — Added press motion, motion tests and README GIFs

The maintainer asked for GIFs of the components in use, for animation on
every interaction, and for a way to test motion. I recorded the GIFs on
Playwright's fake clock: time moves only when a frame is shot, so each
clip has every frame at 50 fps. The first recording showed a real bug.
Arrow keys in a widget also moved the node, and Backspace would delete
it. React Flow ignores keys from elements with the `nokey` class, so
every widget now carries it, and an E2E test proves the fix.

I added `NodePressable`: a spring press and an accent highlight for every
clickable part. The stepper value now rolls, and the select flashes the
chosen option before it closes. The same fake clock now runs 8 motion
tests that check smoothness, overshoot, the 500 ms budget and reduced
motion. The highlight test failed twice before it passed. Motion does
not pass `whileTap` states to children reliably, and it hands opacity
tweens to the Web Animations API, which ignores the fake clock. The
highlight now uses a spring motion value.

Evidence: `pnpm verify` green; motion tests 40/40 over 5 repeats;
`.github/assets/event-flow.gif`, `widgets.gif`, `edges.gif`.

## 2026-09-23 — Wrote the component catalog and the theming plan

The maintainer asked for a full list of in-node components, and for
colors and node backgrounds that are easy to swap. I wrote
`docs/CATALOG.md` with 96 items in 8 groups, each with a build
wave. I checked the compiled CSS: every `gc` utility reads a plain CSS
variable. So a node that sets `--gc-accent` already re-colors every
widget inside it. I wrote `docs/THEMING.md` with 4 layers, and I put
"Node theming" at the top of the queue, because every later widget
depends on that API.

Evidence: `.bg-gc-accent{background-color:var(--gc-accent)}` in the
built CSS; `agent-kit/docs/CATALOG.md`; `agent-kit/ROADMAP.md` queue changes.

## 2026-09-22 — Installed the agent kit and built the foundation

I started GraphComp from an empty repo. GraphComp is a copy-paste
component library for node canvases, in the way shadcn/ui is one for forms
and dialogs. The quality bar is a 7-second UI concept video of a node flow
editor. I measured its colors from the frames and wrote the visual rules
into `docs/DESIGN.md`.

I built on React Flow, Tailwind CSS 4 and Motion, and I ship through the
shadcn registry format. The foundation has 8 registry components, 1 hook,
1 theme and 1 block that rebuilds the flow from the video. The select list
got clipped by the animating node body. I now clip only during the
animation. Animated node heights also made the Vite dev server report
ResizeObserver errors. They are benign, so the playground filters them
before the Vite client sees them.

The seeded queue holds 6 items. The top item publishes the registry so
anyone can install it. Items 2 to 5 add the audio widgets from the video.
The queue is provisional until the maintainer ranks it.

Evidence: `pnpm verify` green — 26 unit and registry tests, 4 E2E tests;
`verify/artifacts/event-flow-open.png`.
