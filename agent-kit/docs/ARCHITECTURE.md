# Architecture

GraphComp is a shadcn-compatible component registry for node canvases,
written in React 19 and TypeScript, built on React Flow 12, Tailwind CSS 4
and Motion. The repo has 7 parts.

| Part | Folder | Task |
|---|---|---|
| Registry source | `registry/graphcomp/` | The components users copy. The product. |
| Registry manifest | `registry.json` | Lists every item, its files and its dependencies. |
| Docs site | `site/`, `index.html`, `vercel.json` | The public website: landing page and one docs page per registry item, with live previews. |
| Playground | `playground/` | A Vite app at `/playground/` that renders the blocks for development and E2E. |
| Web Components wrapper | `wc/` | `<gc-flow-canvas>`: the registry components in one script for HTML pages without React. Built to `dist/wc/graphcomp.js`. |
| Tests | `tests/`, `e2e/` | Vitest unit and registry gates; Playwright E2E. |
| Gate and tooling | `verify/`, `.github/`, `scripts/` | `pnpm verify`, CI, and the GIF recorder. |

## Data flow

How a component reaches a user's app:

1. A contributor edits `registry/graphcomp/ui/node-card.tsx`.
2. `pnpm dev` renders it in the playground through the `@/registry` and
   `@/lib` aliases in `vite.config.ts` and `tsconfig.app.json`.
3. `pnpm verify` lints, typechecks, runs the gates and the E2E suite.
4. `pnpm build` runs `shadcn build`, which inlines each item's source into
   `public/r/<name>.json`.
5. The Vercel deploy serves `public/r` at
   `https://graphcomp.reagent-systems.com/r/` (ROADMAP item "Publish the registry").
6. A user runs `npx shadcn add https://graphcomp.reagent-systems.com/r/node-card.json`.
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
| `ui/node-pressable.tsx` | `NodePressable`: spring press and accent highlight for every clickable part. |
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
| wc ↔ registry | `wc/` imports the registry. Nothing in `registry/` imports `wc/`. `wc/` is not in `registry.json`. |
| site ↔ registry | The site imports the registry and reads `registry.json` and the raw source. The registry never imports the site. |

## Docs site

| File | Task |
|---|---|
| `site/content/docs.ts` | One entry per docs page: demo, usage, props, keys, notes. A new registry item adds an entry here. |
| `site/demos/*-demo.tsx` | Live demos. The Code tab shows this file with user import paths. |
| `site/content/autoplay.ts` | One autoplay script per demo. Each script returns its demo to the start state. |
| `site/lib/autoplay.ts` | Plays a script with synthetic pointer, mouse and key events and a drawn cursor. Trusted input stops it. |
| `site/lib/registry.ts` | Reads `registry.json` and the raw source. |
| `site/content/pages.ts` | Every route with its title, description and OG image; the head tags and JSON-LD. Node-safe: the SEO plugin reads it. |
| `scripts/seo.ts` | Vite plugin: per-route HTML with the UsefulShelf badge, `404.html`, `sitemap.xml`, `robots.txt`. `SITE_URL` overrides the domain. |
| `scripts/brand-assets.mjs` | `pnpm assets`: writes the icons and the OG images in `public/`. |
| `site/lib/router.tsx` | A small history router. `vercel.json` rewrites unknown paths to `index.html`. |
| `site/lib/highlight.ts` | Shiki, loaded on first use, with the TSX, CSS, Bash, JSON and HTML grammars. |

## Web Components wrapper

| File | Task |
|---|---|
| `wc/graphcomp.tsx` | Defines `<gc-flow-canvas>`. Holds the nodes and edges, mounts React in an open shadow root, and fires the DOM events. |
| `wc/canvas.tsx` | The React tree: `FlowCanvas` with a generic `card` node and the `event-flow` node types. |
| `wc/graphcomp.css` | Tailwind, the React Flow base styles and `graphcomp.css`, scanned from `registry/graphcomp/` and `wc/`. |
| `wc/vite.config.ts` | `pnpm wc:build`: one minified ES module at `dist/wc/graphcomp.js`, and `wc/example.html` copied as written. `pnpm build` runs it last. |
| `wc/example.html` | A plain HTML page that loads the bundle with one script tag. Served at `/wc/example.html`. |

The element uses a shadow root, so page styles and GraphComp styles stay
apart. At runtime `graphcomp.tsx` adapts the stylesheet: `:root` tokens
move to `:host`, `.dark` tokens move to `:host(:state(dark))`, and the
Tailwind `@property` rules go to the document, because browsers ignore
them in a shadow root.

In dev, `vite.config.ts` serves `wc/graphcomp.tsx` at `/wc/graphcomp.js`,
so `wc/example.html` works unchanged under `pnpm dev` and in the build.
