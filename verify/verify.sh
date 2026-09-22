#!/usr/bin/env bash
# One command answers "is this repo healthy". CI runs this same script.
set -euo pipefail
cd "$(dirname "$0")/.."

step() { printf '\n\033[1m▶ %s\033[0m\n' "$1"; }

step "Lint"
pnpm lint

step "Build (typecheck, playground, registry)"
pnpm build

step "Unit and registry tests"
pnpm test

step "End-to-end tests"
if node verify/has-browser.mjs; then
  pnpm test:e2e
else
  printf '\033[33mSKIPPED: no Chromium found. Set CHROMIUM_PATH or run `pnpm exec playwright install chromium`.\033[0m\n'
  if [ -n "${CI:-}" ]; then
    echo "E2E may not skip in CI." >&2
    exit 1
  fi
fi

printf '\n\033[32m✔ verify passed\033[0m\n'
