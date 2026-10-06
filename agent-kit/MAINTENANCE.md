# MAINTENANCE.md — the between-features runbook

## Cadence

| Task | When | How |
|---|---|---|
| Issue/PR triage | Weekly, start of cycle | Label, ask for repro, close-with-reason or queue on ROADMAP.md |
| Dependency updates | Weekly (automated) | Merge green Dependabot PRs; batch minors |
| Security advisories | Immediately | `../SECURITY.md` |
| Stale sweep | Automated | `stale.yml` (CI.md) |
| Health check | Per PR + nightly | `pnpm verify` in CI |

## Triage labels

`bug` · `enhancement` · `docs` · `good first issue` · `help wanted` ·
`needs-repro` · `blocked` · `wontfix` · `security` · `ci-failure`

## Issue lifecycle

new → labeled → (needs-repro?) → accepted (queued on ROADMAP.md if it's
feature-shaped) → in progress → closed by PR or closed-with-reason.
Never close silently; one sentence of why is the minimum.

## Outside pull requests

A PR from a fork runs no CI until a maintainer approves its workflow
run. Approval runs the contributor's code on GitHub's runners. So the
review comes first, and the approval second.

1. **Read the whole diff.** Stop and ask the maintainer if it touches
   `.github/`, `package.json`, `pnpm-lock.yaml`, `scripts/`, `verify/`,
   any config that runs code (`vite.config.ts`, `playwright.config.ts`),
   or adds network calls, `eval`, env access or dynamic imports.
2. **Run the gate locally.** Fetch the branch without checking it out
   over your work: `git fetch <fork-url> <branch>:pr<N>`. Then
   `pnpm install --frozen-lockfile` and `pnpm verify`.
3. **Prove the test catches the bug.** Revert the fix file to `main`
   and run the new test. It must fail. Restore the file and run it 5
   times; it must pass 5 of 5.
4. **Approve the workflow run.** Only after steps 1–3. The maintainer
   clicks "Approve and run workflows" on the PR. The agent cannot.
5. **Comment, then merge.** One comment: thanks, what was checked with
   the numbers, and non-blocking notes. Squash-merge only when CI is
   green on the PR head.
6. **Check `main` after the merge.** The CI run for the merge commit
   must be green, and the linked issue must be closed.

The first outside PR was #16, merged on 2026-10-06. See `DEVLOG.md`.

## Deprecation policy

Deprecate in release N with a warning; remove no earlier than N+2.
Every deprecation gets a CHANGELOG entry under "Deprecated".

## Bus factor

Maintainers: @ThyFriendlyFox. If unmaintained, the intent is: archive
with a notice in the README. The registry JSON stays on GitHub Pages, so
existing installs and copies keep working.
