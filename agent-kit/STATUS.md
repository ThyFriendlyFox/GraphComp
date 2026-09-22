# STATUS.md — where the project actually stands

The single source of truth for project state. Claims require evidence: a
passing gate, a linked run, a tag. Updated in the same commit as the
behavior change. The weekly cycle (WEEKLY.md step 5) refreshes it.

| Area | State | Evidence |
|---|---|---|
| Tokens (`graphcomp.css`, light + dark) | ✅ | `tests/registry.test.ts` token gates green |
| FlowCanvas, FlowToolbar, FlowZoomControl | ✅ | E2E "zoom control changes the zoom level" |
| FlowEdge | ✅ | E2E "renders the event flow with its edges" |
| NodePort | ✅ | E2E edges connect to header-aligned ports |
| NodeCard family | ✅ | `tests/node-card.test.tsx`; E2E "opening a trigger pushes the card below it down" |
| NodeSegmented, NodeSelect, NodeStepper | ✅ | `tests/node-*.test.tsx` keyboard paths |
| event-flow block | ✅ | E2E suite; `verify/artifacts/event-flow-open.png` |
| Registry build (`public/r`) | ✅ | `pnpm build` runs `shadcn build` |
| Registry hosting (GitHub Pages) | ❌ | ROADMAP item 1 |
| CI | 🚧 | Workflows committed; first run pending on GitHub |
| NodeKnob, NodeWaveform, NodeDropzone | ❌ | ROADMAP items 2–4 |
| Docs site | ❌ | ROADMAP "Later" |

States: ✅ done (gated) · 🚧 in progress · ❌ not started · 🧊 frozen/won't do.

## Current week

- **Shipping:** between cycles. Next: ROADMAP item 1, "Publish the registry".
- **Last release:** none.
- **Known red:** none. `pnpm verify` passes locally: 26 unit/registry tests, 4 E2E tests.
