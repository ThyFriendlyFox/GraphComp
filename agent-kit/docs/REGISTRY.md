# Registry

A registry item is one installable unit: a component, hook, block or
theme, described in `registry.json` and served as
`https://thyfriendlyfox.github.io/GraphComp/r/<name>.json`. GraphComp has
11 items. Install one with the shadcn CLI:

```sh
npx shadcn add https://thyfriendlyfox.github.io/GraphComp/r/<name>.json
```

The CLI installs the item's `registryDependencies` first. Every `ui` item
depends on `graphcomp-theme` and shadcn's `utils`.

| Item | Type | Installs |
|---|---|---|
| `graphcomp-theme` | `registry:file` | `styles/graphcomp.css` |
| `use-controllable-state` | `registry:hook` | `hooks/use-controllable-state.ts` |
| `flow-canvas` | `registry:ui` | `FlowCanvas`, `FlowToolbar`, `FlowToolbarTab`, `FlowZoomControl` |
| `flow-edge` | `registry:ui` | `FlowEdge` |
| `node-port` | `registry:ui` | `NodePort` |
| `node-pressable` | `registry:ui` | `NodePressable`, the press-feedback button every widget uses |
| `node-card` | `registry:ui` | `NodeCard` and its parts |
| `node-segmented` | `registry:ui` | `NodeSegmented` |
| `node-select` | `registry:ui` | `NodeSelect` |
| `node-stepper` | `registry:ui` | `NodeStepper` |
| `event-flow` | `registry:block` | `components/event-flow/*` |

## Writing a new item

A new item PR includes all of these:

1. The source file under `registry/graphcomp/ui/` (or `hooks/`,
   `blocks/<name>/`). One component family per file, named exports,
   `data-slot` on the root, `className` merged last with `cn()`.
2. Its entry in `registry.json`: `name`, `type`, `title`,
   `description`, `dependencies`, `registryDependencies`, `files`.
   `tests/registry.test.ts` fails until the entry is complete.
3. A test in `tests/<name>.test.tsx` that proves the keyboard path and the
   controlled and uncontrolled modes, and a motion test in
   `e2e/motion.spec.ts` for every motion it adds (`docs/TESTING.md`).
4. A use in a playground block, and an E2E step if the item moves,
   drags or opens anything.
5. Its row in the table above, its tokens in `CONFIGURATION.md` if it
   adds any, and a line in `CHANGELOG.md`.
6. It meets every rule in `docs/DESIGN.md`.
