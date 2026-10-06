import { expect, test, type Page } from "@playwright/test"

import {
  FRAME_MS,
  advance,
  freezeTime,
  largestStep,
  opacityOf,
  rectsOf,
  reversals,
  sample,
  scaleOf,
  settledAt,
} from "./helpers/motion"

// Every test here runs on a frozen clock and reads one value per 60 fps
// frame. See agent-kit/docs/TESTING.md, "Motion tests".

/** agent-kit/docs/DESIGN.md: no motion is longer than 500 ms. */
const BUDGET_MS = 500
/** No single frame may cover more than a third of a motion. A jump is 1. */
const SMOOTH = 0.34
const CARDS = '[data-slot="node-card"]'

function sensitivity(page: Page) {
  return page
    .locator('[data-slot="node-stepper"]')
    .filter({ has: page.getByRole("spinbutton", { name: "Sensitivity" }) })
}

async function openFirstTrigger(page: Page) {
  await page.getByRole("button", { name: "Expand" }).first().click()
  await advance(page, 600)
}

async function pressAndHold(page: Page, target: ReturnType<Page["locator"]>) {
  const box = (await target.boundingBox())!
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
}

test.beforeEach(async ({ page }) => {
  await freezeTime(page)
  await page.goto("/playground/")
  await expect(page.locator(".react-flow__node")).toHaveCount(4)
  await advance(page, 1000)
})

test("edges draw in from source to target on load", async ({ page }) => {
  await page.reload()
  await expect(page.locator('[data-slot="flow-edge"]')).toHaveCount(3)
  const edge = page.locator('[data-slot="flow-edge"] path.react-flow__edge-path').first()
  const drawn = await sample(page, 700, () =>
    edge.evaluate((path) => {
      const [dash] = (path.getAttribute("stroke-dasharray") ?? "1").split(/[\s,]+/).map(Number)
      return Number.isFinite(dash) ? dash : 1
    }),
  )
  expect(drawn[0]).toBeLessThan(0.5)
  expect(drawn.at(-1)).toBeCloseTo(1, 2)
  expect(reversals(drawn, 0.001)).toBe(0)
  expect(largestStep(drawn)).toBeLessThan(SMOOTH)
  expect(settledAt(drawn, 0.001)).toBeLessThanOrEqual(BUDGET_MS)
})

test("a node body opens smoothly, without overshoot, inside the budget", async ({ page }) => {
  const start = (await rectsOf(page, CARDS))[0].height
  await page.getByRole("button", { name: "Expand" }).first().click()

  const heights = await sample(page, 700, async () => (await rectsOf(page, CARDS))[0].height)
  const end = heights.at(-1)!

  expect(end - start).toBeGreaterThan(100)
  expect(Math.max(...heights)).toBeLessThanOrEqual(end + 0.5)
  expect(reversals(heights)).toBe(0)
  expect(largestStep(heights)).toBeLessThan(SMOOTH)
  expect(settledAt(heights)).toBeLessThanOrEqual(BUDGET_MS)
})

test("the card below moves in the same frames as the card that opens", async ({ page }) => {
  await page.getByRole("button", { name: "Expand" }).first().click()

  const gaps = await sample(page, 500, async () => {
    const [opening, below] = await rectsOf(page, CARDS)
    return below.y - (opening.y + opening.height)
  })
  expect(Math.max(...gaps) - Math.min(...gaps)).toBeLessThanOrEqual(1)
})

test("the segmented pill slides to the pressed option", async ({ page }) => {
  await openFirstTrigger(page)
  const record = page.getByRole("radio", { name: "Record" })
  const target = (await record.boundingBox())!.x
  await record.click()

  const pill = page.locator('[data-slot="node-segmented"] [aria-checked="true"] > span').first()
  const xs = await sample(page, 600, async () => (await pill.boundingBox())!.x)
  expect(xs[0]).toBeLessThan(target - 10)
  expect(Math.abs(xs.at(-1)! - target)).toBeLessThan(1)
  expect(largestStep(xs)).toBeLessThan(SMOOTH)
  expect(settledAt(xs)).toBeLessThanOrEqual(BUDGET_MS)
})

test("a press shrinks and highlights the button, then springs back", async ({ page }) => {
  await openFirstTrigger(page)
  const plus = sensitivity(page).getByRole("button", { name: "Increase" })
  const highlight = plus.locator('[data-slot="node-pressable-highlight"]')
  await pressAndHold(page, plus)
  await advance(page, 200)

  expect(await scaleOf(plus)).toBeLessThan(0.97)
  expect(await opacityOf(highlight)).toBeGreaterThan(0.15)

  await page.mouse.up()
  const scales = await sample(page, 500, () => scaleOf(plus))
  expect(scales.at(-1)).toBeCloseTo(1, 2)
  expect(settledAt(scales, 0.005)).toBeLessThanOrEqual(BUDGET_MS)
})

test("the stepper rolls the old value out and the new value in", async ({ page }) => {
  await openFirstTrigger(page)
  const values = sensitivity(page).locator('[data-slot="node-stepper-value"]')
  await sensitivity(page).getByRole("button", { name: "Increase" }).click()

  await advance(page, FRAME_MS * 4)
  await expect(values).toHaveCount(2)
  await expect(values.filter({ hasText: "54%" })).toHaveCount(1)
  await advance(page, BUDGET_MS)
  await expect(values).toHaveCount(1)
  await expect(values).toHaveText("54%")
})

test("the select confirms the choice before it closes", async ({ page }) => {
  await openFirstTrigger(page)
  const trigger = page.getByRole("combobox", { name: "Trigger" }).first()
  await trigger.click()
  await advance(page, 300)
  await page.getByRole("option", { name: "Open Node" }).click()

  await advance(page, FRAME_MS * 3)
  await expect(page.getByRole("option", { name: "Open Node" })).toHaveAttribute("data-confirming")
  await advance(page, BUDGET_MS)
  await expect(page.getByRole("listbox")).toHaveCount(0)
  await expect(trigger).toHaveText("Open Node")
})

test("reduced motion removes the press scale", async ({ page }) => {
  // Motion reads the media query when the page loads.
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.reload()
  await advance(page, 1000)
  await openFirstTrigger(page)
  const plus = sensitivity(page).getByRole("button", { name: "Increase" })
  await pressAndHold(page, plus)
  const scales = await sample(page, 200, () => scaleOf(plus))
  await page.mouse.up()
  expect(scales.filter((scale) => scale > 0.93 && scale < 0.999)).toEqual([])
})

// NodeStatus run state, on its own fixture page. The running pulse loops,
// so the 500 ms rule applies to each leg: every rise or fall settles inside
// the budget, eases without a jump, and stays inside its range.

const STATUS_FIXTURE = "/e2e/fixtures/node-status.html"

function statusPart(page: Page, node: string, part: "dot" | "mark") {
  return page.locator(`.react-flow__node[data-id="${node}"] [data-slot="node-status-${part}"]`)
}

/** Splits a series into runs that move in one direction. */
function legs(values: number[], tolerance = 1e-4) {
  const result: number[][] = []
  let leg = [values[0]]
  let direction = 0
  for (let i = 1; i < values.length; i++) {
    const step = values[i] - values[i - 1]
    const sign = Math.abs(step) <= tolerance ? 0 : Math.sign(step)
    if (sign !== 0 && direction !== 0 && sign !== direction) {
      result.push(leg)
      leg = [values[i - 1]]
    }
    if (sign !== 0) direction = sign
    leg.push(values[i])
  }
  result.push(leg)
  return result
}

async function openStatusFixture(page: Page) {
  await page.goto(STATUS_FIXTURE)
  await expect(page.locator(".react-flow__node")).toHaveCount(5)
  await advance(page, 1000)
}

test("a running status springs in, then pulses with every leg inside the budget", async ({
  page,
}) => {
  await openStatusFixture(page)
  const dot = statusPart(page, "deploy", "dot")
  expect(await scaleOf(dot)).toBe(0)
  await page.getByRole("button", { name: "Deploy running" }).click()

  const scales = await sample(page, 2000, () => scaleOf(dot))
  const runs = legs(scales)
  const peak = scales.indexOf(Math.max(...scales))

  expect(runs.length).toBeGreaterThanOrEqual(4)
  expect(Math.max(...scales)).toBeLessThanOrEqual(1.005)
  expect(Math.min(...scales.slice(peak))).toBeGreaterThan(0.54)
  for (const run of runs.slice(0, -1)) {
    expect(Math.abs(run.at(-1)! - run[0])).toBeGreaterThan(0.4)
    expect(largestStep(run)).toBeLessThan(SMOOTH)
    expect((run.length - 1) * FRAME_MS).toBeLessThanOrEqual(BUDGET_MS)
  }
})

test("a done or error mark springs in without overshoot", async ({ page }) => {
  await openStatusFixture(page)
  for (const state of ["done", "error"]) {
    await page.getByRole("button", { name: `Deploy ${state}` }).click()
    const mark = statusPart(page, "deploy", "mark").last()
    const scales = await sample(page, 600, () => scaleOf(mark))

    expect(scales.at(-1)).toBeCloseTo(1, 2)
    expect(Math.max(...scales)).toBeLessThanOrEqual(1.005)
    expect(largestStep(scales)).toBeLessThan(SMOOTH)
    expect(settledAt(scales, 0.005)).toBeLessThanOrEqual(BUDGET_MS)
  }
})

test("reduced motion stops the running pulse", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await openStatusFixture(page)
  const scales = await sample(page, 1000, () => scaleOf(statusPart(page, "running", "dot")))
  expect(new Set(scales)).toEqual(new Set([1]))

  await page.getByRole("button", { name: "Deploy running" }).click()
  const entry = await sample(page, 300, () => scaleOf(statusPart(page, "deploy", "dot")))
  expect(entry.filter((scale) => scale > 0.001 && scale < 0.999)).toEqual([])
})
