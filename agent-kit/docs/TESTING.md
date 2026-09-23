# Testing

GraphComp tests 5 things: behavior, registry integrity, flows in a real
browser, motion frame by frame, and the README recordings. `pnpm verify`
runs the first 4. `pnpm gifs` makes the recordings.

| Layer | Tool | Files | Runs in |
|---|---|---|---|
| Behavior | Vitest + Testing Library (jsdom) | `tests/node-*.test.tsx` | `pnpm test`, `pnpm verify` |
| Registry integrity | Vitest (node) | `tests/registry.test.ts` | `pnpm test`, `pnpm verify` |
| Flows | Playwright | `e2e/event-flow.spec.ts` | `pnpm test:e2e`, `pnpm verify` |
| Motion | Playwright on a frozen clock | `e2e/motion.spec.ts`, `e2e/helpers/motion.ts` | `pnpm test:e2e`, `pnpm verify` |
| Recordings | Playwright on a frozen clock + ffmpeg | `scripts/record-gifs.mjs` | `pnpm gifs`, the `Record GIFs` workflow |

## Run

```sh
pnpm verify                                  # everything that gates a push
pnpm test                                    # unit and registry only
pnpm test:e2e                                # browser tests only
pnpm exec playwright test e2e/motion.spec.ts # motion tests only
pnpm exec playwright test --ui               # watch tests run, step by step
pnpm gifs                                    # re-record all README GIFs
pnpm gifs widgets                            # re-record one clip
```

Browser tests need Chromium. Run `pnpm exec playwright install chromium`,
or set `CHROMIUM_PATH` to an installed Chromium. `pnpm gifs` also needs
ffmpeg on `PATH`, or `FFMPEG_PATH` set to the binary.

## How the frozen clock works

A motion test or a recording stops page time before the app loads:

```ts
await page.clock.install({ time: START })
await page.clock.pauseAt(START + 1000)
```

From then on, `requestAnimationFrame`, `performance.now`, `Date`,
`setTimeout` and `setInterval` move only when the test says so:

```ts
await page.clock.runFor(1000 / 60) // exactly one 60 fps frame
```

Motion, React Flow's zoom and pan, and every GraphComp timer read that
clock. So a test sees every frame of every animation, the same way on
every machine, however slow the machine is. This is what makes motion
testable and recordings smooth.

## Motion tests

`e2e/helpers/motion.ts` has everything a motion test needs:

| Helper | Use |
|---|---|
| `freezeTime(page)` | Stop page time. Call before `page.goto`. |
| `advance(page, ms)` | Move time forward. |
| `sample(page, ms, read)` | Call `read` once per 60 fps frame for `ms`; returns the values. |
| `settledAt(values)` | Time in ms after which the values stop changing. |
| `largestStep(values)` | Largest change between 2 frames, as a share of the whole change. `1` means the value jumped. |
| `reversals(values)` | Frames that move against the overall direction: overshoot or jitter. |
| `rectsOf(page, selector)` | Bounding boxes of many elements, read in one call. |
| `scaleOf(locator)`, `opacityOf(locator)` | Computed scale and opacity. |

### Write a motion test

1. Freeze time and load the page (the `beforeEach` in `e2e/motion.spec.ts` does this).
2. Do the interaction: a click, a key, `page.mouse.down()`.
3. Sample the value that should move, frame by frame.
4. Assert the motion rules from `docs/DESIGN.md`.

```ts
test("a node body opens smoothly, without overshoot, inside the budget", async ({ page }) => {
  const start = (await rectsOf(page, CARDS))[0].height
  await page.getByRole("button", { name: "Expand" }).first().click()

  const heights = await sample(page, 700, async () => (await rectsOf(page, CARDS))[0].height)

  expect(heights.at(-1)! - start).toBeGreaterThan(100)  // it opened
  expect(reversals(heights)).toBe(0)                     // no overshoot or jitter
  expect(largestStep(heights)).toBeLessThan(0.34)        // no jump: it animated
  expect(settledAt(heights)).toBeLessThanOrEqual(500)    // inside the budget
})
```

### What to assert

| Rule (`docs/DESIGN.md`) | Assertion |
|---|---|
| The change animates | `largestStep(values) < 0.34` |
| No overshoot on bounce-0 springs | `reversals(values) === 0` and `max(values) <= last + 0.5` |
| At most 500 ms | `settledAt(values) <= 500` |
| Things that move together, move in the same frame | Sample both in one `rectsOf` call; their distance stays within 1 px |
| Press feedback | During `mouse.down()`: `scaleOf(button) < 0.97` and highlight `opacityOf > 0.15`; after `mouse.up()` scale settles to 1 |
| Reduced motion | `page.emulateMedia({ reducedMotion: "reduce" })`, reload, then assert no in-between values |

### Pitfalls

- **Read many elements in one call.** Two `boundingBox()` calls can
  straddle a React commit and disagree. Use `rectsOf`.
- **Opacity may run off the clock.** Motion hands some opacity tweens to
  the Web Animations API, which runs on the compositor clock, not the
  fake one. Animate opacity that a test must see with a motion value
  (`useSpring`), as `NodePressable` does. The recorder removes
  `Element.prototype.animate`, so Motion animates everything in its frame
  loop there.
- **CSS transitions run off the clock.** Tailwind `transition-*` classes
  run on real time. Use them only for hover colors; use Motion for any
  motion that a test or a recording must show.
- **Set reduced motion before load.** Motion reads the media query when
  the page loads. Call `emulateMedia`, then `reload`.
- **Scope locators to one widget.** "The last Increase button" changes
  when a block changes. Filter by the widget's label, as `sensitivity()`
  does in `e2e/motion.spec.ts`.
- **Prove the test can fail.** Before you commit a new test, break the
  behavior (stash the fix, or set the duration to 0) and watch it fail.

## Recordings (README GIFs)

`scripts/record-gifs.mjs` drives the playground on the frozen clock and
saves one PNG per frame at 50 fps and 2× pixel density. Then ffmpeg makes
a GIF with one palette per clip.

- 50 fps is the GIF limit. Browsers slow any GIF frame shorter than
  20 ms down to 100 ms.
- A drawn cursor and a click ring show the interaction.
- Each clip is a function in `clips`. It gets a page, a `recorder` with
  `hold`, `moveTo`, `click`, `drag` and `key`, and returns the output width.

### Add a clip

1. Add a function to `clips` in `scripts/record-gifs.mjs`.
2. Script the interaction with the recorder. Keep it under 15 s and 3 MB.
3. Run `pnpm gifs <name>` and check the GIF frame by frame.
4. Embed it in `README.md` from `.github/assets/<name>.gif`.

## Automation

| When | What runs | Where |
|---|---|---|
| Every push and pull request | `pnpm verify`: lint, build, unit, registry, flow and motion tests | `.github/workflows/ci.yml` |
| Every night | `pnpm verify`; files an issue on failure | `.github/workflows/nightly.yml` |
| On demand | `pnpm gifs`; uploads the GIFs as an artifact | `.github/workflows/gifs.yml` (Actions → Record GIFs → Run workflow) |

To refresh the README GIFs after a visual change: run the `Record GIFs`
workflow, download the artifact, check each GIF, and commit the files to
`.github/assets/`. Or run `pnpm gifs` locally and commit the result.
