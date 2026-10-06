# Changelog

All notable changes to GraphComp are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/) · Versioning: [SemVer](https://semver.org/).

## [Unreleased]

### Added

- Design tokens in `graphcomp.css`, light and dark, with React Flow overrides.
- `FlowCanvas`, `FlowToolbar`, `FlowToolbarTab` and `FlowZoomControl`.
- `FlowEdge`: a right-angle edge with rounded corners, a draw-in animation and a midpoint dot.
- `NodePort`: a connection dot outside the node edge, centered or aligned to the header.
- `NodeCard` family: `NodeHeader`, `NodeStatus`, `NodeTitle`, `NodeAction`, `NodeCollapseTrigger`, `NodeBody`, `NodeGrip`, `NodeField` and `NodePanel`.
- `NodeSegmented`, `NodeSelect` and `NodeStepper` widgets with full keyboard support.
- `event-flow` block: an entry point, stacked triggers and two script nodes.
- A shadcn-compatible registry in `registry.json`, built to `public/r`.
- `NodePressable`: every button, segment and grip shrinks on a spring and flashes an accent highlight when pressed.
- `NodeStepper` rolls the old value out and the new value in.
- `NodeSelect` flashes the chosen option before it closes and rolls the trigger label to the new value.
- Motion tests: frame-by-frame checks on a frozen clock for smoothness, overshoot, the 500 ms budget and reduced motion.
- `pnpm gifs` records the README GIFs at 50 fps from the playground.
- Docs site: a landing page with a live canvas, and one page per registry item with a live preview, its source, its install command, its props and its keys.
- `vercel.json` deploys the docs site, the playground at `/playground/` and the registry at `/r/`.
- Docs site SEO: one static HTML file per route with title, description, canonical link, Open Graph, Twitter and JSON-LD tags; `404.html`, `sitemap.xml` and `robots.txt`.
- Docs site previews play by themselves: a drawn cursor presses, drags and connects the real components in a loop. A press or key in the preview stops it; a Pause/Play button controls it; reduced motion starts it paused.
- The UsefulShelf listing badge in the docs site footer.
- Site icons (`favicon.ico`, `icon.svg`, Apple touch icon, 192 and 512 px icons, maskable icon, web manifest) and one Open Graph image per page. `pnpm assets` renders them.
- `FlowBezierEdge` and `FlowStraightEdge`: curved and straight edges with the `FlowEdge` style. Register one as the `flow` edge type to use it for every edge; the drag line takes its shape. The `event-flow` toolbar switches between the 3 edge shapes.

### Changed

- The playground moved from `/` to `/playground/`. The docs site is the root page.
- `pnpm build` builds the registry before the Vite build, so `dist/r` holds the registry JSON.
- The registry moved to `https://graphcomp.reagent-systems.com/r/`. Every `registryDependencies` URL in `registry.json` points there.

### Deprecated

### Removed

### Fixed

- `NodePort` refreshes React Flow port measurements when a port mounts, unmounts or changes its id, position or alignment.
- The UsefulShelf badge is in the server-rendered HTML of every docs site page. Before, only the client-side footer drew it, and the UsefulShelf check did not find it.

- Keys pressed in a widget no longer move or delete the node. Widgets carry the React Flow `nokey` class.
- The drag line from a port has the shape of the default edge. Before, it was always a curve, and it snapped to right angles on release.

### Security
