# AGENTS.md

This repo runs on the agent kit in [`agent-kit/`](agent-kit/).

1. Read [`agent-kit/ROUTING.md`](agent-kit/ROUTING.md) first. It says which file governs your task.
2. [`agent-kit/AGENTS.md`](agent-kit/AGENTS.md) is the binding contract whenever code is touched:
   commands, invariants, landmines, style. It is the only contract; this file only points to it.
3. `pnpm verify` must pass before any push.
