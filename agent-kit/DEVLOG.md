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
