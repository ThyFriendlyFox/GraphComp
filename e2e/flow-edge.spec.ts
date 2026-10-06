import { expect, test, type Page } from "@playwright/test"

const edge = (page: Page, id: string) => page.locator(`.react-flow__edge[data-id="${id}"]`)
const label = (page: Page, text: string) =>
  page.locator('[data-slot="flow-edge-label"]').filter({ hasText: text })

async function center(page: Page, selector: string) {
  return page.evaluate((selector) => {
    const { x, y, width, height } = document.querySelector(selector)!.getBoundingClientRect()
    return { x: x + width / 2, y: y + height / 2 }
  }, selector)
}

/** The label center and the center of its edge path, read in one call. */
function labelAndPathCenters(page: Page, id: string, text: string) {
  return page.evaluate(
    ({ id, text }) => {
      const mid = (element: Element) => {
        const { x, y, width, height } = element.getBoundingClientRect()
        return { x: x + width / 2, y: y + height / 2 }
      }
      const path = document.querySelector(
        `.react-flow__edge[data-id="${id}"] path.react-flow__edge-path`,
      )!
      const labelElement = [...document.querySelectorAll('[data-slot="flow-edge-label"]')].find(
        (element) => element.textContent === text,
      )!
      return { label: mid(labelElement), path: mid(path) }
    },
    { id, text },
  )
}

let errors: string[] = []

test.beforeEach(async ({ page }) => {
  errors = []
  page.on("pageerror", (error) => errors.push(String(error)))
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()))

  await page.goto("/e2e/fixtures/flow-edge.html")
  await expect(page.locator('[data-slot="flow-edge"]')).toHaveCount(3)
  // The path draws in for 500 ms; the midpoint marker springs in after 250 ms.
  await page.waitForTimeout(800)
})

test.afterEach(() => {
  expect(errors).toEqual([])
})

test("clicking the midpoint dot selects the edge", async ({ page }) => {
  const dot = await center(page, '.react-flow__edge[data-id="ship-notify"] circle')
  await page.mouse.click(dot.x, dot.y)

  await expect(edge(page, "ship-notify")).toHaveClass(/selected/)
  await expect(edge(page, "yes")).not.toHaveClass(/selected/)
})

test("a label renders at the midpoint and moves with the node", async ({ page }) => {
  await expect(label(page, "Yes")).toBeVisible()
  await expect(label(page, "No")).toBeVisible()
  await expect(edge(page, "yes").locator("circle")).toHaveCount(0)

  const before = await labelAndPathCenters(page, "yes", "Yes")
  expect(Math.abs(before.label.x - before.path.x)).toBeLessThan(2)
  expect(Math.abs(before.label.y - before.path.y)).toBeLessThan(2)

  const ship = await center(page, '.react-flow__node[data-id="ship"]')
  await page.mouse.move(ship.x, ship.y)
  await page.mouse.down()
  await page.mouse.move(ship.x, ship.y - 120, { steps: 8 })
  await page.mouse.up()

  const after = await labelAndPathCenters(page, "yes", "Yes")
  expect(before.label.y - after.label.y).toBeGreaterThan(30)
  expect(Math.abs(after.label.x - after.path.x)).toBeLessThan(2)
  expect(Math.abs(after.label.y - after.path.y)).toBeLessThan(2)
})

test("clicking a label selects its edge, and the label follows the selected state", async ({
  page,
}) => {
  await label(page, "Yes").click()
  await expect(edge(page, "yes")).toHaveClass(/selected/)
  await expect(page.locator("body")).toHaveAttribute("data-clicked-edge", "yes")
  await expect(edge(page, "no")).not.toHaveClass(/selected/)
  await expect(label(page, "Yes")).toHaveAttribute("data-selected", "true")
  await expect(label(page, "No")).not.toHaveAttribute("data-selected")

  await label(page, "No").click()
  await expect(edge(page, "no")).toHaveClass(/selected/)
  await expect(edge(page, "yes")).not.toHaveClass(/selected/)
  await page.mouse.move(0, 0)
  await page.screenshot({ path: "verify/artifacts/flow-edge-labels.png" })

  await page.locator(".react-flow__pane").click({ position: { x: 10, y: 10 } })
  await expect(edge(page, "no")).not.toHaveClass(/selected/)
  await expect(label(page, "No")).not.toHaveAttribute("data-selected")
})

test("the keyboard selects a labeled edge", async ({ page }) => {
  await edge(page, "yes").focus()
  await page.keyboard.press("Enter")
  await expect(edge(page, "yes")).toHaveClass(/selected/)
  await expect(label(page, "Yes")).toHaveAttribute("data-selected", "true")

  await page.keyboard.press("Escape")
  await expect(edge(page, "yes")).not.toHaveClass(/selected/)
})
