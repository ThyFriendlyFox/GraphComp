# AGENTS.md — the binding contract

In effect whenever code in this repo is touched, by agent or human.
When this conflicts with intuition, this wins.

## Commands

```sh
pnpm build      # typecheck, build the playground, build the registry to public/r
pnpm test       # unit tests and registry gates (Vitest)
pnpm lint       # Prettier check + ESLint
pnpm verify     # full health gate — must pass before any push
pnpm dev        # playground at http://localhost:5173
```

Requires Node.js 22+ and pnpm 10+. The E2E step needs Chromium: run
`pnpm exec playwright install chromium`, or set `CHROMIUM_PATH` to an
installed Chromium binary.

## Invariants — never regress these

1. **Copy-paste, not a package.** Every component is a source file under
   `registry/graphcomp/`, listed in `registry.json`, installed by the
   shadcn CLI into the user's project. No runtime package named
   `graphcomp` is ever required by a component.
2. **Registry imports only.** Registry files import each other only
   through `@/registry/graphcomp/{ui,hooks}/<name>` and `@/lib/utils`.
   The shadcn CLI rewrites these to the user's aliases. Relative imports
   are allowed only between files of one `registry:block`.
   `tests/registry.test.ts` enforces this.
3. **Every import is declared.** An npm import must appear in the item's
   `dependencies`; a registry import in its `registryDependencies`.
   `tests/registry.test.ts` enforces this.
4. **Tokens, not colors.** Components read color, radius and shadow only
   from `gc-*` tokens in `registry/graphcomp/styles/graphcomp.css`. No
   hex values or Tailwind palette colors in components. Light and dark
   define the same variables.
5. **React Flow is the engine.** GraphComp styles and extends
   `@xyflow/react`; it never forks or reimplements pan, zoom, selection
   or edge routing.
6. **Widgets stay inside the canvas.** Interactive widgets carry the
   `nodrag` class (and `nowheel` if they scroll). Popovers render inside
   the node, not in a portal, so they pan and zoom with the canvas.
7. **Accessible by default.** Every widget has a WAI-ARIA role, full
   keyboard support and a visible focus ring. Icon-only buttons take
   `aria-label`. A test proves the keyboard path.
8. **Motion respects the user.** `FlowCanvas` wraps everything in
   `MotionConfig reducedMotion="user"`. Durations stay under 400 ms.
   Motion never blocks input.

## Landmine map

| Area | Why it bites |
|---|---|
| `NodeBody` overflow | Body clips overflow only while it animates. Clip it always and `NodeSelect` lists get cut off at the node edge. |
| `FlowCanvas` `edgeTypes` / `nodeTypes` | React Flow warns and remounts when these objects change identity. Memoize or define them at module scope. |
| `NodePort` inside nested cards | Handles position against the nearest `relative` ancestor. `NodeCard` is `relative` on purpose; do not remove it. Ports in one flow node need unique `id`s. |
| `ResizeObserver loop` errors in dev | Animated node heights make React Flow re-measure each frame. The browser reports a benign error. `index.html` filters it before the Vite client; do not "fix" it in the library. |
| `registry.json` homepage URLs | `registryDependencies` point at `https://thyfriendlyfox.github.io/GraphComp/r/`. A rename of the repo or Pages path breaks every install. |
| TypeScript version | `typescript-eslint` supports TypeScript < 6.1. Do not bump TypeScript past it until typescript-eslint does. |
| Playwright browsers | The Playwright version pins a Chromium build. In sandboxes without the download, use `CHROMIUM_PATH`. |

## House style

- Match the surrounding code's idiom, naming, and comment density.
- Components follow the shadcn shape: one file per item, named exports,
  `data-slot` attributes, `className` merged last with `cn()`.
- No demo scaffolding, no leftover diagnostics, no dead flags.
- Comments state constraints the code can't show — never narration.
- User-facing copy states the thing plainly; no reassurance microcopy.

## Process rules

- Branch from `main`; never commit to it directly.
- `pnpm verify` green before every push. Flaky gate → fix or
  quarantine in the same PR; never route around it.
- After adding/removing/renaming source files, update `registry.json`,
  run `pnpm install` if dependencies changed, and commit the lockfile.
- Commit at boundaries; message says what changed and cites evidence.
- Docs move with behavior — same commit or PR.
- Report outcomes faithfully; failing is failing, with output.
