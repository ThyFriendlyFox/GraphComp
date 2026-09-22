# VERIFICATION.md — one command answers "is this repo healthy"

`pnpm verify` runs `verify/verify.sh`, in order:

1. Lint / format check — `pnpm lint` (Prettier, ESLint with React Hooks rules)
2. Build — `pnpm build` (`tsc -b`, Vite build of the playground, `shadcn build` of the registry)
3. Tests — `pnpm test` (Vitest + Testing Library, jsdom)
   - `tests/node-*.test.tsx` — widget behavior and keyboard paths
   - `tests/registry.test.ts` — registry integrity gate: every file listed
     once, every import declared, every `gc-*` token defined, light and
     dark define the same variables
4. End-to-end — `pnpm test:e2e` (Playwright on the playground)
   - Fails on any page error or console error
   - Writes screenshots to `verify/artifacts/` as evidence

## Rules

- CI runs **the same command** as local. No CI-only logic.
- A gate that can't run in some environment **skips loudly**, never
  passes silently. E2E skips with a yellow `SKIPPED` line when no
  Chromium exists — and never skips when `CI` is set.
- New behavior lands with its gate in the same PR whenever feasible.
- A feature's completion promise (ROADMAP.md) should be backed by a gate
  here whenever it can be — evidence that keeps proving itself beats
  evidence produced once.
- Fixing a flaky or broken gate is always in scope, for any task.
