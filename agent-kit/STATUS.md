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
| Registry hosting (GitHub Pages) | ❌ | ROADMAP "Publish the registry" |
| CI | 🚧 | Workflows committed; first run pending on GitHub |
| NodeKnob, NodeWaveform, NodeDropzone | ❌ | ROADMAP items NodeKnob, NodeWaveform, NodeDropzone |
| Docs site | ❌ | ROADMAP "Later" |
| NodePressable and interaction motion | ✅ | `e2e/motion.spec.ts`: 8 motion tests, 40/40 over 5 repeats |
| README GIFs (`pnpm gifs`) | ✅ | `.github/assets/*.gif`, 50 fps |
| Scoped token theming (`--gc-*` on any element) | ✅ | Utilities compile to `var(--gc-*)`; see `docs/THEMING.md` |
| Node theming props and `NodeSurface` | ❌ | ROADMAP "Node theming" |

States: ✅ done (gated) · 🚧 in progress · ❌ not started · 🧊 frozen/won't do.

## Current week

- **Shipping:** between cycles. Next: ROADMAP item 1, "Node theming".
- **Last release:** none.
- **Known red:** none. `pnpm verify` passes locally: 27 unit/registry tests, 13 E2E tests (8 of them motion tests).
