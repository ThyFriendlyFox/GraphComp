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

## 2026-10-06 — Fixed 2 regressions from the first outside contribution

PR #16 made `NodePort` re-measure its node on mount. I reviewed and merged
it, and I missed 2 bugs in it. The playground opened at 125% zoom with a
node off screen: React Flow resolves the first `fitView` on the first
re-measure, and the port re-measured 1 node before React Flow measured
all 4. A node id with a `"` also crashed the canvas, because React Flow's
hook builds an unescaped selector. An agent building issue #8 found the
zoom bug; I found the selector bug while reviewing issue #12.

`NodePort` now waits until React Flow has measured the node, and finds the
node element from its own DOM position. My review of PR #16 checked the
port rename only, on a page with 2 nodes and no `fitView` assertion. The
new E2E test checks that `fitView` frames every playground node.

Evidence: `e2e/event-flow.spec.ts` "fitView frames every node" and the
quoted-id node in `e2e/fixtures/node-port.tsx` fail on `main` and pass
with the fix; the PR #16 rename test still passes, 20 of 20 repeats.

## 2026-10-06 — Merged the first outside contribution

@mikemikimike sent PR #16 for issue #6. An edge vanished when its port
was renamed on a node that kept its size. The fix makes `NodePort` ask
React Flow to re-measure the node when a port mounts, unmounts or
changes. I read the whole diff before the maintainer approved CI. It
touched no dependencies, workflows or scripts. I reverted the fix and
the new E2E test failed 3 of 3 times; with the fix it passed 5 of 5.
The maintainer approved the workflow run, CI went green, and I
squash-merged it with a thank-you comment.

The local gate first showed 23 red E2E tests. A sandbox proxy blocked 2
third-party URLs, and `main` failed the same way. I wrote the review
steps into `MAINTENANCE.md` and the proxy case into `docs/TESTING.md`.
I queued "Hermetic E2E" so the gate stops depending on those hosts.

Evidence: merge commit `b9995a0`; CI green on `main` at `b9995a0`;
37 E2E tests pass with the proxy workaround, 36 on `main` before.

## 2026-10-01 — Correction: the listing badge was not in the server HTML

The UsefulShelf check failed with "Badge not found". It reads the HTML the
server sends, and only the React footer drew the badge, after scripts ran.
I named this risk when I added the badge but did not fix it. The SEO build
plugin now renders the `UsefulShelfBadge` component into the static HTML of
every page. Without scripts that HTML shows the badge; with scripts, React
shows the same component in the footer. A unit test checks every built page
for a followed badge link, and an E2E test finds it with scripts turned off.

Evidence: `pnpm verify` green; `tests/seo.test.ts`; `e2e/site.spec.ts` 23 tests.

## 2026-10-01 — Made the docs previews play by themselves, added the listing badge

The maintainer asked for the site examples to move. Every preview now
plays a short script in a loop. A drawn cursor presses widgets, opens
nodes, picks options, drags nodes and drags a connection between ports.
The script sends the same pointer and mouse events a user sends, so each
motion on screen is the component's own. A real press or key in the
preview stops it, because synthetic events are not trusted. A Pause and
Play button controls it, and reduced motion starts it paused. I also
added the UsefulShelf badge to the footer, as the maintainer pasted it.
The sandbox browser cannot load the badge image, so E2E stubs that host.

Evidence: `pnpm verify` green; `e2e/site.spec.ts` 22 tests.

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
