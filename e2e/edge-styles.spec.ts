import { expect, test, type Page } from "@playwright/test"

let errors: string[] = []

test.beforeEach(({ page }) => {
  errors = []
  page.on("pageerror", (error) => errors.push(String(error)))
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()))
})

test.afterEach(() => {
  expect(errors).toEqual([])
})

const STRAIGHT = /^M[^A-Za-z]+L[^A-Za-z]+$/

/** Drags a connection from the source port of node C to below node B. Returns the drag line path. */
async function dragLine(page: Page) {
  const port = page.locator('.react-flow__node[data-id="c"] .react-flow__handle.source')
  const target = page.locator('.react-flow__node[data-id="b"]')
  await expect(port).toBeVisible()
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  )
  const from = (await port.boundingBox())!
  const to = (await target.boundingBox())!
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2)
  await page.mouse.down()
  await page.mouse.move(to.x + to.width / 2, to.y + to.height + 120, { steps: 8 })
  const line = page.locator("path.react-flow__connection-path")
  await expect(line).toHaveCount(1)
  const d = (await line.getAttribute("d"))!
  await page.mouse.up()
  return d
}

test("the default drag line has right angles, like FlowEdge", async ({ page }) => {
  await page.goto("/e2e/fixtures/edge-styles.html")
  await expect(page.locator('[data-slot="flow-edge"]')).toHaveCount(1)

  const d = await dragLine(page)
  expect(d).not.toMatch(/C/)
  expect(d).not.toMatch(STRAIGHT)
})

test("with FlowBezierEdge as the default, the edge and the drag line curve", async ({ page }) => {
  await page.goto("/e2e/fixtures/edge-styles.html?edge=bezier")
  const edge = page.locator('[data-slot="flow-bezier-edge"] path.react-flow__edge-path')
  await expect(edge).toHaveCount(1)
  await expect(edge).toHaveAttribute("d", /C/)
  await expect(page.locator('[data-slot="flow-bezier-edge"] circle')).toHaveCount(1)

  expect(await dragLine(page)).toMatch(/C/)
})

test("with FlowStraightEdge as the default, the edge and the drag line are straight", async ({
  page,
}) => {
  await page.goto("/e2e/fixtures/edge-styles.html?edge=straight")
  const edge = page.locator('[data-slot="flow-straight-edge"] path.react-flow__edge-path')
  await expect(edge).toHaveCount(1)
  await expect(edge).toHaveAttribute("d", STRAIGHT)
  await expect(page.locator('[data-slot="flow-straight-edge"] circle')).toHaveCount(1)

  expect(await dragLine(page)).toMatch(STRAIGHT)
})

test("a consumer's connectionLineType wins over the default edge shape", async ({ page }) => {
  await page.goto("/e2e/fixtures/edge-styles.html?line=bezier")
  await expect(page.locator('[data-slot="flow-edge"]')).toHaveCount(1)

  expect(await dragLine(page)).toMatch(/C/)
})
