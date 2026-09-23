# Architecture

GraphComp is a shadcn-compatible component registry for node canvases,
written in React 19 and TypeScript, built on React Flow 12, Tailwind CSS 4
and Motion. The repo has 5 parts.

| Part | Folder | Task |
|---|---|---|
| Registry source | `registry/graphcomp/` | The components users copy. The product. |
| Registry manifest | `registry.json` | Lists every item, its files and its dependencies. |
| Playground | `playground/`, `index.html` | A Vite app that renders the blocks for development and E2E. |
| Tests | `tests/`, `e2e/` | Vitest unit and registry gates; Playwright E2E. |
| Gate and tooling | `verify/`, `.github/` | `pnpm verify` and CI. |

## Data flow

How a component reaches a user's app:

1. A contributor edits `registry/graphcomp/ui/node-card.tsx`.
2. `pnpm dev` renders it in the playground through the `@/registry` and
   `@/lib` aliases in `vite.config.ts` and `tsconfig.app.json`.
3. `pnpm verify` lints, typechecks, runs the gates and the E2E suite.
4. `pnpm build` runs `shadcn build`, which inlines each item's source into
   `public/r/<name>.json`.
5. GitHub Pages serves `public/r` at
   `https://thyfriendlyfox.github.io/GraphComp/r/` (ROADMAP item "Publish the registry").
6. A user runs `npx shadcn add https://thyfriendlyfox.github.io/GraphComp/r/node-card.json`.
7. The shadcn CLI resolves `registryDependencies`, installs npm
   `dependencies`, rewrites `@/registry/graphcomp/ui/*` imports to the
   user's `ui` alias, and writes the files into the user's project.

## Registry source

| File | Task |
|---|---|
| `styles/graphcomp.css` | `gc-*` tokens (light, dark), Tailwind `@theme inline` mapping, React Flow overrides. |
| `lib/utils.ts` | `cn()`. Local copy of shadcn's `utils` item; not published. |
| `hooks/use-controllable-state.ts` | Controlled / uncontrolled state for every widget. |
| `ui/flow-canvas.tsx` | `FlowCanvas` (themed `ReactFlow`), `FlowToolbar`, `FlowToolbarTab`, `FlowZoomControl`. |
| `ui/flow-edge.tsx` | `FlowEdge`, registered as edge type `flow`. |
| `ui/node-port.tsx` | `NodePort`, a styled React Flow `Handle`. |
| `ui/node-card.tsx` | `NodeCard` and its parts; open/closed state lives in its context. |
| `ui/node-segmented.tsx` | `NodeSegmented`. |
| `ui/node-select.tsx` | `NodeSelect`. |
| `ui/node-stepper.tsx` | `NodeStepper`. |
| `blocks/event-flow/*` | The reference block: `EventFlow` and its node types. |

## Boundaries

| Boundary | Rule |
|---|---|
| registry ↔ user project | Only aliased imports cross (`@/registry/graphcomp/...`, `@/lib/utils`). Enforced by `tests/registry.test.ts`. |
| ui ↔ React Flow | `ui/` may use any public `@xyflow/react` API. It never patches React Flow internals. |
| ui ↔ theme | Components read `gc-*` tokens only. The theme never references a component. |
| widgets ↔ canvas | Widgets are plain React. They know nothing about React Flow except the `nodrag` / `nowheel` classes. |
| blocks ↔ ui | Blocks compose `ui/` items. `ui/` never imports a block. |
| playground ↔ registry | The playground imports the registry. The registry never imports the playground. |
