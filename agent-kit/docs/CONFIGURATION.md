# Configuration

GraphComp has no config file. Users configure it in 2 places: CSS
variables in `graphcomp.css`, and props on `FlowCanvas`. The repo's
tooling reads 3 environment variables.

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
| `--gc-node-header` | color | `#f7f7f8` / `#3c3c3c` | Node header, grip, toolbar |
| `--gc-node-border` | color | `#dcdce0` / `#444446` | Node and toolbar borders |
| `--gc-inset` | color | `#eeeef0` / `#2b2b2b` | Widget wells (select, stepper, segmented) |
| `--gc-panel` | color | `#f4f4f5` / `#3c3c3c` | `NodePanel` surface |
| `--gc-control` | color | `#e4e4e7` / `#4a4a4c` | Raised controls (knob face, reserved) |
| `--gc-fg` | color | `#1c1c1e` / `#ececec` | Text, edge dots |
| `--gc-muted` | color | `#6e6e73` / `#8e8e93` | Eyebrows, icons, inactive text |
| `--gc-accent` | color | `#1a8ae0` / `#299bed` | Ports, selection, active pill |
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
| `connectionLineType` | `ConnectionLineType` | shape of the default edge type | Shape of the drag line while the user connects 2 ports |

### Edge shape

Every edge takes the `flow` edge type unless it names another. To choose
curved or straight edges, register that edge as `flow`, at module scope:

```tsx
import { FlowBezierEdge } from "@/components/ui/flow-bezier-edge"

const edgeTypes = { flow: FlowBezierEdge }

<FlowCanvas edgeTypes={edgeTypes} />
```

The drag line takes the same shape. `FlowCanvas` reads it from a static
`connectionLineType` on the default edge component:

| Default edge | Drag line |
|---|---|
| `FlowEdge` (no static) | `ConnectionLineType.SmoothStep` |
| `FlowBezierEdge` | `ConnectionLineType.Bezier` |
| `FlowStraightEdge` | `ConnectionLineType.Straight` |

A `connectionLineType` prop on `FlowCanvas` wins over the default edge.
React Flow draws its smooth-step drag line with a 5 px corner radius;
`FlowEdge` uses 10 px. React Flow takes no radius for the drag line.

## Environment (repo tooling only)

| Field | Type | Default | Use |
|---|---|---|---|
| `CHROMIUM_PATH` | path | unset | Chromium binary for E2E when the Playwright download is unavailable |
| `GRAPHCOMP_BASE` | string | `/` | Vite `base` for the playground build (Pages uses `/GraphComp/`) |
| `FFMPEG_PATH` | path | `ffmpeg` on `PATH` | ffmpeg binary for `pnpm gifs` |
| `CI` | any | unset | Set by CI. E2E may not skip; Playwright uses the GitHub reporter |
