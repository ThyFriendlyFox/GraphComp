import type { Locator, Page } from "@playwright/test"

/** One frame at 60 fps. */
export const FRAME_MS = 1000 / 60

const START = new Date("2026-01-01T00:00:00Z").getTime()

/**
 * Stops page time before the app loads. From here on, requestAnimationFrame,
 * performance.now, Date and timers move only when a test calls `advance` or
 * `sample`, so every animation frame can be inspected.
 */
export async function freezeTime(page: Page) {
  await page.clock.install({ time: START })
  await page.clock.pauseAt(START + 1000)
}

export async function advance(page: Page, ms: number) {
  await page.clock.runFor(ms)
}

/**
 * Runs `read` once per frame for `ms` milliseconds and returns the values.
 * Index 0 is the first frame after the call, so index `i` is at
 * `(i + 1) * FRAME_MS` ms.
 */
export async function sample<T>(page: Page, ms: number, read: () => Promise<T>) {
  const values: T[] = []
  for (let t = 0; t < ms; t += FRAME_MS) {
    await page.clock.runFor(FRAME_MS)
    values.push(await read())
  }
  return values
}

/** The time in ms after which a series stays within `tolerance` of its last value. */
export function settledAt(values: number[], tolerance = 0.5) {
  const last = values[values.length - 1]
  let index = values.length - 1
  while (index > 0 && Math.abs(values[index - 1] - last) <= tolerance) index--
  return Math.round((index + 1) * FRAME_MS)
}

/** The largest change between 2 frames, as a share of the whole change (0–1). */
export function largestStep(values: number[]) {
  const total = Math.abs(values[values.length - 1] - values[0]) || 1
  let largest = 0
  for (let i = 1; i < values.length; i++) {
    largest = Math.max(largest, Math.abs(values[i] - values[i - 1]))
  }
  return largest / total
}

/** Number of frames where the series moves against its overall direction by more than `tolerance`. */
export function reversals(values: number[], tolerance = 0.5) {
  const sign = Math.sign(values[values.length - 1] - values[0])
  let count = 0
  for (let i = 1; i < values.length; i++) {
    if ((values[i] - values[i - 1]) * sign < -tolerance) count++
  }
  return count
}

/** The x scale of an element's computed transform. 1 when it has none. */
export function scaleOf(locator: Locator) {
  return locator.evaluate((element) => {
    const transform = getComputedStyle(element).transform
    return transform === "none" ? 1 : new DOMMatrixReadOnly(transform).a
  })
}

/** The computed opacity of an element. */
export async function opacityOf(locator: Locator) {
  return Number(await locator.evaluate((element) => getComputedStyle(element).opacity))
}

/**
 * Bounding boxes of every element that matches `selector`, read in one
 * call. Separate reads can straddle a React commit and disagree.
 */
export function rectsOf(page: Page, selector: string) {
  return page.evaluate(
    (selector) =>
      [...document.querySelectorAll(selector)].map((element) => {
        const { x, y, width, height } = element.getBoundingClientRect()
        return { x, y, width, height }
      }),
    selector,
  )
}
