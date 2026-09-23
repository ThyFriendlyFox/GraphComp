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

### Changed

### Deprecated

### Removed

### Fixed

- Keys pressed in a widget no longer move or delete the node. Widgets carry the React Flow `nokey` class.

### Security
