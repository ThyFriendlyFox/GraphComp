# STATUS.md — where the project actually stands

The single source of truth for project state. Claims require evidence: a
passing gate, a linked run, a tag. Updated in the same commit as the
behavior change. The weekly cycle (WEEKLY.md step 5) refreshes it.

| Area | State | Evidence |
|---|---|---|
| Tokens (`graphcomp.css`, light + dark) | ✅ | `tests/registry.test.ts` token gates green |
| FlowCanvas, FlowToolbar, FlowZoomControl | ✅ | E2E "zoom control changes the zoom level" |
| FlowEdge | ✅ | E2E "renders the event flow with its edges" |
| NodePort | ✅ | `tests/node-port.test.tsx`; E2E keeps an edge connected after a port id changes |
| NodeCard family | ✅ | `tests/node-card.test.tsx`; E2E "opening a trigger pushes the card below it down" |
| NodeSegmented, NodeSelect, NodeStepper | ✅ | `tests/node-*.test.tsx` keyboard paths |
| event-flow block | ✅ | E2E suite; `verify/artifacts/event-flow-open.png` |
| Registry build (`public/r`) | ✅ | `pnpm build` runs `shadcn build` |
| Registry hosting (`graphcomp.reagent-systems.com/r`) | ❌ | ROADMAP "Publish the registry" |
| CI | ✅ | `ci.yml` green on `main` at `b9995a0`; `nightly.yml` and `stale.yml` green on schedule |
| E2E without third-party hosts | ❌ | ROADMAP "Hermetic E2E" |
| NodeKnob, NodeWaveform, NodeDropzone | ❌ | ROADMAP items NodeKnob, NodeWaveform, NodeDropzone |
| Docs site (`site/`, Vercel config) | 🚧 | `e2e/site.spec.ts`: 23 tests; Vercel project not created yet |
| Docs site SEO, icons, OG images | 🚧 | `tests/seo.test.ts`: 6 tests; `public/og/` 13 images |
| NodePressable and interaction motion | ✅ | `e2e/motion.spec.ts`: 8 motion tests, 40/40 over 5 repeats |
| README GIFs (`pnpm gifs`) | ✅ | `.github/assets/*.gif`, 50 fps |
| Scoped token theming (`--gc-*` on any element) | ✅ | Utilities compile to `var(--gc-*)`; see `docs/THEMING.md` |
| Node theming props and `NodeSurface` | ❌ | ROADMAP "Node theming" |

States: ✅ done (gated) · 🚧 in progress · ❌ not started · 🧊 frozen/won't do.

## Current week

- **Shipping:** ROADMAP item 1, "Docs site". Next: "Hermetic E2E".
- **Last release:** none.
- **Known red:** none in CI. `pnpm verify` at `b9995a0`: 34 unit/registry tests, 37 E2E tests. Behind a TLS proxy, about 23 E2E tests fail on third-party loads; see `docs/TESTING.md`.
