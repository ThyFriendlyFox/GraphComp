# Design

The quality bar for every GraphComp component. A component that misses a
rule here is not done, even with green gates.

## Reference

The bar comes from the "Instrumental Workflows" node flow UI concept by
Ali Zafar Iqbal (2021), a 7-second motion study of a dark node editor.
The video is not in this repo. The measurements below were taken from its
frames at 1600×1200 and are the working reference.

What the reference shows:

- A dark canvas with a faint square grid and a slim toolbar: the graph
  name at the left, "− Canvas Zoom +" in the center.
- An entry point: a large accent dot in a dark halo.
- Nodes with a two-line title (a small muted eyebrow such as "Script",
  then the name), a ring status indicator at the left and a round action
  at the right.
- Right-angle edges with rounded corners, a small light dot at each
  midpoint, and accent dots at the ports, set a short gap outside the node.
- Nodes stacked in a column. Opening one pushes the next one down in the
  same motion.
- Node bodies with a segmented control, a select whose list opens over
  its trigger in accent blue, a "− 53% +" stepper, a "2 sec" spin input,
  rotary knobs, waveform players with scrubbers and a file drop zone.
- A node that widens when content is added. Its neighbours slide right
  and back.
- A grip pill at the bottom of every open node.

## Surfaces

| Surface | Token | Measured (dark) |
|---|---|---|
| Canvas | `gc-canvas` | `#1b1a1d` |
| Grid line | `gc-grid` | `#201f22`, raised to `#252428` for legibility |
| Node header | `gc-node-header` | `#3c3c3c` |
| Node body | `gc-node` | `#333333` |
| Widget well | `gc-inset` | `#2e2e2e` → `#2b2b2b` |
| Accent | `gc-accent` | `#299bed` |
| Open select list | `gc-accent-strong` | `#2386ce` |

Rules:

- Depth comes from lightness steps of about 4–8%, not from borders.
  Borders are 1 px and at most 1 step lighter than the surface.
- Accent marks only interactive state: ports, the selected option, the
  active status dot, focus. Never decoration.
- Corners are `--gc-radius` (4 px). Pills and dots are fully round.
  Nothing else is rounded.

## Type and density

- Base size 12 px; eyebrows 10 px; nothing larger inside a node.
- Title weight 500; everything else 400.
- Numbers use `tabular-nums`.
- Row height 32 px for widgets; 44 px for the node header; 12 px padding
  in a body; 12 px gap between rows.
- A field row is label (72 px) + control. Labels do not wrap.

## Motion

| Change | Motion |
|---|---|
| Body opens or closes | Height 0 ↔ auto and opacity, spring, bounce 0, 350 ms |
| Segmented selection | Shared-layout pill slide, spring, bounce 0.15, 350 ms |
| Select list | Scale-Y 0.9 → 1 from the top, and opacity, 250 ms; exit 120 ms |
| Edge appears | Path draws from source to target, 500 ms ease-out; midpoint dot springs in after 250 ms |
| Icon swap (+ / −) | Rotate 90° cross-fade, spring, 350 ms |
| Neighbours make room | Position spring, bounce 0, 350 ms (ROADMAP item 6) |

Rules:

- Motion explains a layout change. It never decorates a still screen.
- Everything that moves because something else changed moves in the same
  frame with the same spring. No staggered chains except the edge dot.
- No motion is longer than 500 ms. Input is never blocked by motion.
- `prefers-reduced-motion: reduce` removes transform and layout motion
  (`MotionConfig reducedMotion="user"` in `FlowCanvas`).

## Interaction

- Every widget works with the keyboard alone, with a 2 px `gc-ring` focus
  ring on `:focus-visible` only.
- Widgets never start a canvas drag (`nodrag`) and never scroll the
  canvas (`nowheel`).
- Popovers stay inside the node and zoom with it.
- Hover states change color only, never size, except ports, which grow
  to show they accept a connection.

## Review checklist

- [ ] Uses only `gc-*` tokens; looks right in light and dark.
- [ ] Sizes and spacing match the tables above.
- [ ] Motion matches the table; reduced motion tested.
- [ ] Keyboard path tested; roles and labels correct.
- [ ] Screenshot of the component in the playground attached to the PR.
