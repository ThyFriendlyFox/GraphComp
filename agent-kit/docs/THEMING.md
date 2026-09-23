# Theming

GraphComp themes in 4 layers. Each layer overrides the one above it, for
the part of the canvas it wraps. Layers 1 and 2 work today. Layers 3 and 4
are the ROADMAP item "Node theming".

| Layer | Scope | How | Status |
|---|---|---|---|
| 1. Global tokens | Whole app | Edit `graphcomp.css` | ✅ |
| 2. Scoped tokens | Any subtree | Set `--gc-*` on an element or class | ✅ |
| 3. Node props | One node | `accent`, `tone`, `variant` on `NodeCard` | 🔜 |
| 4. Surface slot | One node's background | `<NodeSurface>` with any React content | 🔜 |

## Why this works

Every component reads colors through Tailwind utilities that compile to
plain CSS variables:

```css
.bg-gc-accent { background-color: var(--gc-accent); }
```

A CSS variable set on an element applies to everything inside it. So a
node that sets `--gc-accent` re-colors its ports, pills, selects, focus
rings and every widget in its body. No widget needs a color prop.

## 1. Global tokens

Change the values in `styles/graphcomp.css`. The token table is in
`docs/CONFIGURATION.md`.

## 2. Scoped tokens

Set variables on a class or an inline style.

```css
.theme-ember {
  --gc-accent: #f97316;
  --gc-accent-strong: #ea580c;
  --gc-node-header: #3a2a22;
}
```

```tsx
<NodeCard className="theme-ember">…</NodeCard>
<NodeCard style={{ "--gc-accent": "#22c55e" } as React.CSSProperties}>…</NodeCard>
```

## 3. Node props (planned)

```tsx
<NodeCard accent="#a855f7" />        // derives accent-strong and ring from one color
<NodeCard tone="ember" />            // named preset from graphcomp.css
<NodeCard variant="glass" />         // solid | glass | outline | ghost
```

- `accent` sets `--gc-accent`, and derives `--gc-accent-strong` and
  `--gc-ring` with `color-mix()`. One color in, a full accent out.
- `tone` applies a preset class, `gc-tone-<name>`. Presets ship in
  `graphcomp.css`: `blue` (default), `ember`, `mint`, `violet`, `rose`,
  `amber`, `slate`. Users add their own with one CSS block.
- `variant` changes the shell: `solid` (default), `glass` (translucent
  with backdrop blur), `outline` (border only), `ghost` (no fill).
- Themes serialize with the graph: store `{ accent, tone, variant }` in
  `node.data.theme` and spread it onto `NodeCard`.

## 4. Surface slot (planned)

`NodeSurface` renders any React content behind the node content, clipped
to the node shape.

```tsx
<NodeCard variant="glass">
  <NodeSurface>
    <div className="size-full bg-[radial-gradient(circle_at_20%_0%,var(--gc-accent),transparent_60%)]" />
  </NodeSurface>
  <NodeHeader>…</NodeHeader>
</NodeCard>
```

Allowed surface content: CSS gradients, images, video, animated SVG,
`<canvas>`, WebGL shaders, live data (for example a waveform that fills
the node).

Rules the slot enforces:

- It sits behind the header and body, and never takes pointer events.
- It is clipped to `--gc-radius`.
- A `scrim` prop (0–1, default 0) lays `--gc-node` over the surface, so
  text keeps its contrast on busy backgrounds.
- Animated surfaces pause when `prefers-reduced-motion` is set and when
  the node is off screen.
