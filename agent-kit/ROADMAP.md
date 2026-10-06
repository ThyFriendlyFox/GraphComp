# ROADMAP.md — the source of all work

**This file is not optional.** Every feature the agent builds flows down
from here. If it isn't on this roadmap, it doesn't get built; if it needs
building, it gets added here first. One item ships per weekly cycle
(see `WEEKLY.md`).

## North star

GraphComp is the shadcn/ui of node canvases. A developer runs one
`npx shadcn add` command and owns production-grade node, edge, port and
in-node widget source code, built on React Flow, Tailwind CSS and Motion.
Every component meets the quality bar in `docs/DESIGN.md`: calm dark
surfaces, dense but legible controls, spring motion that explains layout
changes, and full keyboard access. The catalog grows until a team can
build a visual scripting editor, an AI workflow builder or an audio
patcher from GraphComp parts alone.

## Feature Queue — ordered; top unblocked item ships next

<!-- provisional: true — seeded by SETUP on 2026-09-22. The human has not
     ranked this queue yet. Re-order freely; record why under "Queue
     changes". -->

### 1. Docs site
- **Promise:** A docs site at the root of the deploy shows a landing page with a live canvas, an install command with a copy button, and one page per registry item with a live preview, its highlighted source and its install command; the E2E suite opens every page and proves the copy button and the preview. Every page has its own static HTML with title, description, canonical link, Open Graph and Twitter tags, JSON-LD and a 1200×630 OG image, listed in `sitemap.xml`.
- **Evidence:** `e2e/site.spec.ts`; `tests/seo.test.ts`; `public/og/*.png` and the icons from `pnpm assets`; a `vercel.json` that serves the site, the playground at `/playground/` and `public/r` at `/r/`; screenshots of the landing page and a component page in light and dark.
- **Use case:** Add a node canvas to an existing app.
- **Scope guard:** No search. No MDX pipeline. No versioned docs. Pages cover shipped items only.
- **Status:** in progress

### 2. Hermetic E2E
- **Promise:** `pnpm test:e2e` passes with every request to a host other than `localhost` blocked, and a test fails if a page requests such a host without a route for it.
- **Evidence:** A Playwright fixture that routes third-party hosts (the UsefulShelf badge, Vercel Analytics) to local stubs; the suite green with the network blocked; `e2e/site.spec.ts` still finds the badge link in the server HTML.
- **Use case:** Add a node canvas to an existing app. The E2E gate decides what ships; it must not go red when a third-party host is down.
- **Scope guard:** Test setup only. No change to the badge, the analytics or the site markup.
- **Status:** ready

### 3. Node theming
- **Promise:** `NodeCard` accepts `accent`, `tone` and `variant` props, and a `NodeSurface` slot renders any React content behind the node, clipped and non-interactive; a playground node with a custom accent and an animated gradient surface passes E2E, and every existing widget inside it takes the node's accent.
- **Evidence:** `tests/node-card.test.tsx` cases for each prop; E2E that reads the computed port color of a themed node; light and dark screenshots of the themed node.
- **Use case:** Re-theme every canvas in a product.
- **Scope guard:** No theme editor UI. No per-widget color props. 7 tone presets only.
- **Status:** ready

### 4. Publish the registry
- **Promise:** In a fresh Vite + React + Tailwind project, `npx shadcn add https://graphcomp.reagent-systems.com/r/event-flow.json` installs the block and its dependencies, and `vite build` passes, in a gate that runs in `pnpm verify`.
- **Evidence:** The Vercel deploy of the docs site serves `public/r`; a new `verify/install-smoke.sh` gate that installs from the built registry (served locally) into a scratch project and builds it.
- **Use case:** Add a node canvas to an existing app.
- **Scope guard:** No docs site. No custom CLI. No npm package.
- **Status:** ready

### 5. NodeKnob
- **Promise:** `NodeKnob` changes its value by vertical drag, wheel and arrow keys, exposes `role="slider"` with `aria-valuenow`, and animates the indicator with a spring, proven by unit tests and an E2E drag test.
- **Evidence:** `tests/node-knob.test.tsx`; E2E drag step; screenshot in `verify/artifacts/`.
- **Use case:** Build an audio patch editor.
- **Scope guard:** No MIDI learn. No bipolar or stepped detents (queue them under Later if needed).
- **Status:** ready

### 6. NodeWaveform
- **Promise:** `NodeWaveform` draws bars from a peaks array, shows played bars in full color and unplayed bars dimmed, and seeks by click, drag or arrow keys on a `role="slider"` scrubber, proven by unit tests.
- **Evidence:** `tests/node-waveform.test.tsx`; screenshot in `verify/artifacts/`.
- **Use case:** Build an audio patch editor.
- **Scope guard:** Draws given peaks only; no audio decoding and no playback engine. Play state is a prop.
- **Status:** ready

### 7. NodeDropzone
- **Promise:** `NodeDropzone` accepts files by drop and by keyboard-activated file picker, filters by `accept`, shows a drag-over state, and calls `onFiles` with the accepted files, proven by unit tests.
- **Evidence:** `tests/node-dropzone.test.tsx`; E2E drop test with `setInputFiles`.
- **Use case:** Build an audio patch editor.
- **Scope guard:** No upload, no progress bar, no storage.
- **Status:** ready

### 8. Sound block
- **Promise:** A `sound-flow` registry block composes NodeKnob, NodeWaveform and NodeDropzone into a "Tone Box" node that widens when a clip is added, and the E2E suite proves the width change animates.
- **Evidence:** Block in `registry.json`; E2E width assertion; screenshot.
- **Use case:** Build an audio patch editor.
- **Scope guard:** Neighbour nodes do not move yet (that is item 9).
- **Status:** blocked on items 5, 6 and 7

### 9. Neighbour reflow
- **Promise:** When a node grows and overlaps a neighbour, `useNodeReflow` moves the neighbour clear with a spring, and moves it back when the node shrinks, proven by an E2E test that measures both positions.
- **Evidence:** E2E test; screen recording linked in the PR.
- **Use case:** Build a visual scripting editor.
- **Scope guard:** One axis (horizontal push). No general auto-layout.
- **Status:** ready

## Later — candidates, not yet specced

The full component list is in `docs/CATALOG.md`. Items move from there
into the queue above, one at a time, with a promise.


- Node palette / command menu (the `⊕` button in the reference) — how users add nodes.
- Canvas side rail and minimap themed with tokens.
- Edge labels, animated "flow" edges and edge context menu.
- Context menu for nodes (duplicate, delete, disable).
- Visual regression snapshots for light and dark.
- `graphcomp` CLI wrapper with a registry namespace (`npx shadcn add @graphcomp/node-card`).
- Undo/redo and copy/paste hooks.
- Ports for Svelte Flow and Vue Flow.

## Shipped

<!-- Move queue items here when done, newest first, with the release tag
     and the evidence link. This is the project's real history of intent. -->

| Week | Feature | Release | Evidence |
|---|---|---|---|
| 2026-10-06 | Edge shapes: `flow-bezier-edge` and `flow-straight-edge`; the drag line matches the default edge (issue #7) | unreleased | `e2e/edge-styles.spec.ts`; `e2e/event-flow.spec.ts` edge style test; `tests/flow-*-edge.test.tsx` |
| 2026-09-25 | NodePort refreshes React Flow port measurements when ports mount, unmount or change | unreleased | `tests/node-port.test.tsx`; `e2e/node-port.spec.ts` |
| 2026-09-23 | Interaction motion (NodePressable, stepper roll, select confirm), frame-by-frame motion tests, README GIFs, widget `nokey` fix | unreleased | `e2e/motion.spec.ts` 40/40 over 5 repeats; `.github/assets/*.gif` |
| 2026-09-22 | Foundation: tokens, FlowCanvas, FlowEdge, NodePort, NodeCard, NodeSegmented, NodeSelect, NodeStepper, event-flow block | unreleased | `pnpm verify` green; `verify/artifacts/event-flow-open.png` |

## Explicitly not doing

- An npm component package — copy-paste ownership is the product; a package takes it away.
- A custom canvas engine — React Flow already solves pan, zoom, selection and routing well.
- Bundling a design system — GraphComp tokens live beside shadcn/ui tokens and never replace them.

## Queue changes

<!-- Any reorder, insertion above position 3, or item removal gets one
     line here: date, what changed, why. -->

- 2026-09-22 — Queue seeded by SETUP. Marked provisional.
- 2026-09-23 — Shipped out of queue: interaction motion, motion tests and README GIFs. The maintainer asked for press and action animations and for a way to test them. The widget key bug surfaced while recording.
- 2026-09-23 — Inserted "Node theming" at position 1. The maintainer wants node colors and backgrounds swappable; every later widget depends on that API, so it ships first.
- 2026-10-01 — Inserted "Docs site" at position 1. The maintainer asked for a website for the library, like the shadcn/ui site. The maintainer hosts it on Vercel. The deploy also serves `public/r`, so item 3 must pick one registry host.
- 2026-10-06 — Inserted "Hermetic E2E" at position 2. While reviewing PR #16 I found that the E2E gate loads 2 third-party URLs; it goes red when a proxy blocks them, and would go red if either host went down. It is small and protects every later item. "Publish the registry" is now item 4.
- 2026-10-06 — Shipped out of queue: edge shapes (`flow-bezier-edge`, `flow-straight-edge`, matching drag line), from issue #7. The maintainer asked to resolve every open issue and chose separate edge items.
