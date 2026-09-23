# Catalog

Every component GraphComp plans to ship, in one list. This file is the
menu; `ROADMAP.md` is the order. An item moves to the Feature Queue with a
completion promise before anyone builds it.

Status: ✅ shipped · 🔜 in the Feature Queue · ◻️ planned.
Wave: the build order after the queue. Wave 1 covers the most common
nodes; wave 3 covers specialist editors.

Every item follows `docs/DESIGN.md`, reads only `gc-*` tokens, and so
takes its colors from the node it sits in (see `docs/THEMING.md`).

## 1. Canvas and chrome

| Item | What it is | Status | Wave |
|---|---|---|---|
| `flow-canvas` | Themed React Flow with grid, toolbar and zoom control | ✅ | — |
| `flow-minimap` | Minimap with nodes drawn in their own accent color | ◻️ | 1 |
| `flow-rail` | Vertical icon rail at the canvas edge | ◻️ | 2 |
| `flow-palette` | Command menu to search and add nodes (the `⊕` button) | ◻️ | 1 |
| `flow-context-menu` | Right-click menu for canvas, node and edge | ◻️ | 1 |
| `flow-selection-toolbar` | Floating actions over a multi-selection: align, group, delete | ◻️ | 2 |
| `flow-inspector` | Side panel that edits the selected node's full settings | ◻️ | 2 |
| `flow-breadcrumbs` | Path through nested subgraphs | ◻️ | 3 |
| `flow-search` | Find a node by name and fly to it | ◻️ | 2 |
| `flow-status-bar` | Bottom bar: node count, run state, zoom | ◻️ | 3 |
| `flow-shortcuts` | Keyboard shortcut sheet | ◻️ | 3 |

## 2. Node shells

| Item | What it is | Status | Wave |
|---|---|---|---|
| `node-card` | Header, status ring, title, collapsible body, grip, fields, panels | ✅ | — |
| `node-surface` | Slot for the node background: gradient, image, SVG, canvas, shader | 🔜 | — |
| `node-stack` | Column of cards in one flow node; opening one pushes the rest | ◻️ | 1 |
| `node-group` | Titled frame around nodes; moves them together | ◻️ | 1 |
| `node-note` | Sticky note with Markdown | ◻️ | 1 |
| `node-entry` | Start point: large accent dot with halo | ◻️ | 1 |
| `node-pill` | Compact one-line node: icon, label, ports | ◻️ | 1 |
| `node-reroute` | A dot that bends edges; no body | ◻️ | 2 |
| `node-subgraph` | Node that opens into its own canvas | ◻️ | 3 |
| `node-resizer` | Themed resize handles | ◻️ | 2 |
| `node-toolbar` | Floating actions above a selected node | ◻️ | 2 |
| `node-tabs` | Tabs inside a node body | ◻️ | 1 |
| `node-state` | Running shimmer, error, warning, bypassed, done states on the shell | ◻️ | 1 |

## 3. Edges and ports

| Item | What it is | Status | Wave |
|---|---|---|---|
| `flow-edge` | Right-angle edge, rounded corners, midpoint dot | ✅ | — |
| `flow-edge-pulse` | Edge with dots that travel source to target while data flows | ◻️ | 1 |
| `flow-edge-label` | Edge with a label chip at the midpoint | ◻️ | 1 |
| `flow-edge-bezier` | Curved variant of `flow-edge` | ◻️ | 2 |
| `flow-edge-button` | Edge with a delete or insert button on hover | ◻️ | 2 |
| `node-port` | Accent dot outside the node edge | ✅ | — |
| `node-port-typed` | Port colored and shaped by data type; rejects wrong types | ◻️ | 1 |
| `node-port-list` | Labeled inputs and outputs in rows, one port per row | ◻️ | 1 |

## 4. Widgets: inputs

| Item | What it is | Status | Wave |
|---|---|---|---|
| `node-select` | Select that opens over its trigger | ✅ | — |
| `node-segmented` | Segmented control with sliding pill | ✅ | — |
| `node-stepper` | `− 53% +` and `2 sec ⇅` | ✅ | — |
| `node-knob` | Rotary knob: drag, wheel, keys | 🔜 | — |
| `node-dropzone` | Drop files, or pick them with the keyboard | 🔜 | — |
| `node-input` | Single-line text | ◻️ | 1 |
| `node-textarea` | Multi-line text that grows with content | ◻️ | 1 |
| `node-switch` | On/off toggle | ◻️ | 1 |
| `node-checkbox` | Checkbox with label | ◻️ | 1 |
| `node-slider` | Horizontal slider with value readout | ◻️ | 1 |
| `node-range` | Two-thumb range slider | ◻️ | 2 |
| `node-combobox` | Searchable select | ◻️ | 1 |
| `node-multiselect` | Select many; shows chips | ◻️ | 2 |
| `node-tags` | Free-text tag input | ◻️ | 2 |
| `node-color` | Swatch row and hex input | ◻️ | 1 |
| `node-vector` | X / Y / Z number fields | ◻️ | 2 |
| `node-key-value` | Editable key and value rows | ◻️ | 2 |
| `node-date` | Date and time picker | ◻️ | 3 |
| `node-hotkey` | Records a key combination | ◻️ | 3 |
| `node-code` | Code field with syntax colors | ◻️ | 2 |
| `node-expression` | One-line formula with variable chips | ◻️ | 3 |
| `node-curve` | Bezier curve or ADSR envelope editor | ◻️ | 3 |
| `node-gradient` | Gradient stop editor | ◻️ | 3 |

## 5. Widgets: display and feedback

| Item | What it is | Status | Wave |
|---|---|---|---|
| `node-waveform` | Waveform bars with scrubber | 🔜 | — |
| `node-progress` | Linear progress bar, determinate and indeterminate | ◻️ | 1 |
| `node-progress-ring` | Circular progress | ◻️ | 1 |
| `node-steps` | Segmented progress: step 3 of 5 | ◻️ | 1 |
| `node-timer` | Countdown with start, pause, reset | ◻️ | 1 |
| `node-stopwatch` | Elapsed time; lap list | ◻️ | 2 |
| `node-badge` | Status pill: idle, running, done, error | ◻️ | 1 |
| `node-stat` | Label and large value, with trend | ◻️ | 1 |
| `node-meter` | Level meter, for example audio VU or CPU | ◻️ | 2 |
| `node-sparkline` | Inline line chart | ◻️ | 1 |
| `node-bars` | Small bar chart | ◻️ | 2 |
| `node-spectrum` | Live frequency bars | ◻️ | 3 |
| `node-image` | Image preview with aspect lock | ◻️ | 1 |
| `node-video` | Video preview with scrubber | ◻️ | 3 |
| `node-log` | Streaming log lines, auto-scroll, levels | ◻️ | 1 |
| `node-json` | Collapsible JSON tree | ◻️ | 2 |
| `node-table` | Small data table with header | ◻️ | 2 |
| `node-markdown` | Rendered Markdown | ◻️ | 2 |
| `node-diff` | Before and after text diff | ◻️ | 3 |
| `node-skeleton` | Loading placeholder rows | ◻️ | 1 |
| `node-token-meter` | Used and remaining budget, for example LLM tokens | ◻️ | 2 |

## 6. Widgets: collections

| Item | What it is | Status | Wave |
|---|---|---|---|
| `node-list` | Rows with icon, label and trailing value | ◻️ | 1 |
| `node-sortable-list` | List reordered by drag or keyboard | ◻️ | 2 |
| `node-checklist` | Checkable rows with a done count | ◻️ | 1 |
| `node-tree` | Nested rows that open and close | ◻️ | 2 |
| `node-accordion` | Titled sections inside a body | ◻️ | 1 |
| `node-queue` | Items waiting, running and done, with counts | ◻️ | 2 |
| `node-clip-list` | Media rows (the stacked sound clips in the reference) | ◻️ | 2 |

## 7. Widgets: actions

| Item | What it is | Status | Wave |
|---|---|---|---|
| `node-button` | Primary, secondary and ghost buttons | ◻️ | 1 |
| `node-run-controls` | Play, pause, stop, step | ◻️ | 1 |
| `node-split-button` | Action plus a menu of variants | ◻️ | 2 |
| `node-copy` | Copies a value; shows done state | ◻️ | 2 |
| `node-menu` | Overflow menu from the header action | ◻️ | 1 |

## 8. Blocks

| Item | What it is | Status | Wave |
|---|---|---|---|
| `event-flow` | Game events: entry, triggers, scripts | ✅ | — |
| `sound-flow` | Tone Box with knobs, waveforms, dropzone | 🔜 | — |
| `agent-flow` | LLM agent: prompt, model, tools, branch, output | ◻️ | 1 |
| `pipeline-flow` | Data pipeline: source, transform, sink, with logs | ◻️ | 2 |
| `automation-flow` | Trigger and action automation with timers | ◻️ | 2 |
| `state-machine` | States and transitions with guards | ◻️ | 3 |
| `shader-flow` | Material graph with typed ports and previews | ◻️ | 3 |
| `mind-map` | Free-form notes and links | ◻️ | 3 |
