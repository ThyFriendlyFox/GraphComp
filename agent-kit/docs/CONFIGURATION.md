# Configuration

GraphComp has no config file. Users configure it in 3 places: CSS
variables in `graphcomp.css`, props on `FlowCanvas`, and `data` on each
`FlowEdge`. The repo's tooling reads 3 environment variables.

A missing variable falls back to the default below. A token set to an
invalid CSS value makes that one property fall back to its initial value;
nothing crashes.

## Theme tokens (`styles/graphcomp.css`)

Set on `:root` (light) and `.dark` (dark). Tailwind utilities use the
`gc-` prefix: `bg-gc-node`, `text-gc-muted`, `rounded-gc`, `shadow-gc`.

| Field | Type | Default (light / dark) | Use |
|---|---|---|---|
| `--gc-canvas` | color | `#f4f4f5` / `#1b1a1d` | Canvas background |
| `--gc-grid` | color | `#e4e4e7` / `#252428` | Grid lines |
| `--gc-node` | color | `#ffffff` / `#333333` | Node body |
| `--gc-node-header` | color | `#f7f7f8` / `#3c3c3c` | Node header, grip, toolbar, edge labels |
| `--gc-node-border` | color | `#dcdce0` / `#444446` | Node, toolbar and edge label borders |
| `--gc-inset` | color | `#eeeef0` / `#2b2b2b` | Widget wells (select, stepper, segmented) |
| `--gc-panel` | color | `#f4f4f5` / `#3c3c3c` | `NodePanel` surface |
| `--gc-control` | color | `#e4e4e7` / `#4a4a4c` | Raised controls (knob face, reserved) |
| `--gc-fg` | color | `#1c1c1e` / `#ececec` | Text, edge dots, edge labels |
| `--gc-muted` | color | `#6e6e73` / `#8e8e93` | Eyebrows, icons, inactive text |
| `--gc-accent` | color | `#1a8ae0` / `#299bed` | Ports, selection (edge, edge label), active pill |
| `--gc-accent-strong` | color | `#1576c2` / `#2386ce` | Open `NodeSelect` list |
| `--gc-accent-fg` | color | `#ffffff` / `#ffffff` | Text on accent |
| `--gc-edge` | color | `#a1a1aa` / `#9a9a9e` | Edge stroke |
| `--gc-ring` | color | `#1a8ae0` / `#299bed` | Focus ring |
| `--gc-shadow` | shadow | see file | Node elevation |
| `--gc-radius` | length | `4px` | Node and widget corners |

## `FlowCanvas` props

All `ReactFlow` props pass through. GraphComp adds or changes these:

| Field | Type | Default | Use |
|---|---|---|---|
| `grid` | boolean | `true` | Draw the line grid |
| `gridGap` | number | `24` | Grid cell size in flow units |
| `edgeTypes` | `EdgeTypes` | `{ flow: FlowEdge }` | Merged over the default |
| `defaultEdgeOptions` | object | `{ type: "flow" }` | Merged over the default |

## `FlowEdge` data

Set on each edge as `data`. All React Flow edge fields pass through.

| Field | Type | Default | Use |
|---|---|---|---|
| `dot` | boolean | `true` | Draw a dot at the middle of the edge |
| `label` | ReactNode | unset | Text at the middle of the edge, in place of the dot. A click on it selects the edge |

## Environment (repo tooling only)

| Field | Type | Default | Use |
|---|---|---|---|
| `CHROMIUM_PATH` | path | unset | Chromium binary for E2E when the Playwright download is unavailable |
| `GRAPHCOMP_BASE` | string | `/` | Vite `base` for the playground build (Pages uses `/GraphComp/`) |
| `FFMPEG_PATH` | path | `ffmpeg` on `PATH` | ffmpeg binary for `pnpm gifs` |
| `CI` | any | unset | Set by CI. E2E may not skip; Playwright uses the GitHub reporter |
