# Use cases

Each case has the same shape.
**Add** names the items the developer installs. **Compose** says what
they build from them. **Result** says what their user gets.

## Add a node canvas to an existing app

**Add.** Run `npx shadcn add` for `flow-canvas`, `node-card` and `node-port`.
**Compose.** Write one custom node from `NodeCard` parts and pass it to `FlowCanvas`.
**Result.** The app has a themed, zoomable canvas that matches its shadcn/ui components.

## Build a visual scripting editor

**Add.** Install the `event-flow` block.
**Compose.** Replace the sample triggers and scripts with the game's events and actions.
**Result.** Designers wire gameplay logic without code, and each node opens to show its settings.

## Build an AI workflow builder

**Add.** Install `node-card`, `node-select`, `node-stepper` and `node-segmented`.
**Compose.** Make nodes for prompts, models, tools and branches, with model and temperature controls in the body.
**Result.** Users build and tune agent pipelines on one canvas.

## Build an audio patch editor

**Add.** Install `node-card`, and the knob, waveform and dropzone widgets when they ship.
**Compose.** Make source, effect and output nodes; drop clips onto a node to load them.
**Result.** Users patch sound chains and hear the effect of each knob.

## Build a data pipeline editor

**Add.** Install `flow-canvas`, `node-card` and `node-select`.
**Compose.** Make source, transform and sink nodes; collapse finished steps to save space.
**Result.** Engineers read a whole pipeline at a glance and open only the step they change.

## Re-theme every canvas in a product

**Add.** Install `graphcomp-theme`.
**Compose.** Change the `gc-*` tokens once in `graphcomp.css`.
**Result.** Every node, edge and widget in every canvas changes together, in light and dark.
