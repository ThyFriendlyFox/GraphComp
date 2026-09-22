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

### 1. Publish the registry
- **Promise:** In a fresh Vite + React + Tailwind project, `npx shadcn add https://thyfriendlyfox.github.io/GraphComp/r/event-flow.json` installs the block and its dependencies, and `vite build` passes, in a gate that runs in `pnpm verify`.
- **Evidence:** A GitHub Pages deploy workflow that publishes `public/r` and the playground; a new `verify/install-smoke.sh` gate that installs from the built registry (served locally) into a scratch project and builds it.
- **Use case:** Add a node canvas to an existing app.
- **Scope guard:** No docs site. No custom CLI. No npm package.
- **Status:** ready

### 2. NodeKnob
- **Promise:** `NodeKnob` changes its value by vertical drag, wheel and arrow keys, exposes `role="slider"` with `aria-valuenow`, and animates the indicator with a spring, proven by unit tests and an E2E drag test.
- **Evidence:** `tests/node-knob.test.tsx`; E2E drag step; screenshot in `verify/artifacts/`.
- **Use case:** Build an audio patch editor.
- **Scope guard:** No MIDI learn. No bipolar or stepped detents (queue them under Later if needed).
- **Status:** ready

### 3. NodeWaveform
- **Promise:** `NodeWaveform` draws bars from a peaks array, shows played bars in full color and unplayed bars dimmed, and seeks by click, drag or arrow keys on a `role="slider"` scrubber, proven by unit tests.
- **Evidence:** `tests/node-waveform.test.tsx`; screenshot in `verify/artifacts/`.
- **Use case:** Build an audio patch editor.
- **Scope guard:** Draws given peaks only; no audio decoding and no playback engine. Play state is a prop.
- **Status:** ready

### 4. NodeDropzone
- **Promise:** `NodeDropzone` accepts files by drop and by keyboard-activated file picker, filters by `accept`, shows a drag-over state, and calls `onFiles` with the accepted files, proven by unit tests.
- **Evidence:** `tests/node-dropzone.test.tsx`; E2E drop test with `setInputFiles`.
- **Use case:** Build an audio patch editor.
- **Scope guard:** No upload, no progress bar, no storage.
- **Status:** ready

### 5. Sound block
- **Promise:** A `sound-flow` registry block composes NodeKnob, NodeWaveform and NodeDropzone into a "Tone Box" node that widens when a clip is added, and the E2E suite proves the width change animates.
- **Evidence:** Block in `registry.json`; E2E width assertion; screenshot.
- **Use case:** Build an audio patch editor.
- **Scope guard:** Neighbour nodes do not move yet (that is item 6).
- **Status:** blocked on items 2, 3 and 4

### 6. Neighbour reflow
- **Promise:** When a node grows and overlaps a neighbour, `useNodeReflow` moves the neighbour clear with a spring, and moves it back when the node shrinks, proven by an E2E test that measures both positions.
- **Evidence:** E2E test; screen recording linked in the PR.
- **Use case:** Build a visual scripting editor.
- **Scope guard:** One axis (horizontal push). No general auto-layout.
- **Status:** ready

## Later — candidates, not yet specced

- Docs site with live previews and copy buttons — the shadcn experience, not only the registry.
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
| 2026-09-22 | Foundation: tokens, FlowCanvas, FlowEdge, NodePort, NodeCard, NodeSegmented, NodeSelect, NodeStepper, event-flow block | unreleased | `pnpm verify` green; `verify/artifacts/event-flow-open.png` |

## Explicitly not doing

- An npm component package — copy-paste ownership is the product; a package takes it away.
- A custom canvas engine — React Flow already solves pan, zoom, selection and routing well.
- Bundling a design system — GraphComp tokens live beside shadcn/ui tokens and never replace them.

## Queue changes

<!-- Any reorder, insertion above position 3, or item removal gets one
     line here: date, what changed, why. -->

- 2026-09-22 — Queue seeded by SETUP. Marked provisional.
