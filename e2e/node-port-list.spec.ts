import { expect, test, type Page } from "@playwright/test"

import { advance, freezeTime, rectsOf, sample } from "./helpers/motion"

const CARD = '.react-flow__node[data-id="decision"] [data-slot="node-card"]'
const ROWS = `${CARD} [data-slot="node-port-row"]`
const PORTS = ["answer:yes", "answer:no", "answer:later"].map(
  (id) => `.react-flow__node[data-id="decision"] .react-flow__handle[data-handleid="${id}"]`,
)
const EDGES = '[data-slot="flow-edge"]'
/** NodePort's default offset. The card has a 1 px border. */
const OFFSET = 14

let errors: string[] = []

test.beforeEach(async ({ page }) => {
  errors = []
  page.on("pageerror", (error) => errors.push(String(error)))
  page.on("console", (message) => {
    // React Flow warns when an edge's handle is missing; that is an edge drop.
    if (message.type() === "error" || message.text().includes("[React Flow]")) {
      errors.push(message.text())
    }
  })
  await freezeTime(page)
  await page.goto("/e2e/fixtures/node-port-list.html")
  await expect(page.locator(EDGES)).toHaveCount(3)
  await advance(page, 1000)
})

test.afterEach(() => {
  expect(errors).toEqual([])
})

/** One read per frame: how many edges are drawn and how many row ports exist. */
async function frame(page: Page) {
  return page.evaluate(
    ({ edges, ports }) => ({
      edges: document.querySelectorAll(edges).length,
      ports: ports.map((selector) => document.querySelectorAll(selector).length),
    }),
    { edges: EDGES, ports: PORTS },
  )
}

async function centers(page: Page) {
  const [card] = await rectsOf(page, CARD)
  const ports = (await rectsOf(page, PORTS.join(", "))).map((rect) => ({
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2,
  }))
  return { card, ports }
}

test("each row port sits on the card edge, centered on its row", async ({ page }) => {
  const { card, ports } = await centers(page)
  const rows = await rectsOf(page, ROWS)

  expect(rows).toHaveLength(3)
  expect(ports).toHaveLength(3)
  for (const [index, port] of ports.entries()) {
    expect(Math.abs(port.x - (card.x + card.width - 1 + OFFSET))).toBeLessThanOrEqual(1)
    expect(Math.abs(port.y - (rows[index].y + rows[index].height / 2))).toBeLessThanOrEqual(1)
  }
  await page.screenshot({ path: "verify/artifacts/node-port-list-open.png" })
})

test("collapsing and reopening keeps every row edge drawn in every frame", async ({ page }) => {
  const node = page.locator('.react-flow__node[data-id="decision"]')

  await node.getByRole("button", { name: "Collapse" }).first().click()
  const closing = await sample(page, 700, () => frame(page))

  // Closed: the ports moved to the header and the rows are gone.
  await expect(page.locator(ROWS)).toHaveCount(0)
  const closed = await centers(page)
  expect(closed.card.height).toBeLessThan(50)
  for (const port of closed.ports) {
    expect(Math.abs(port.y - (closed.card.y + 22))).toBeLessThanOrEqual(1)
    expect(Math.abs(port.x - (closed.card.x + closed.card.width - 1 + OFFSET))).toBeLessThanOrEqual(
      1,
    )
  }
  await page.screenshot({ path: "verify/artifacts/node-port-list-closed.png" })

  await node.getByRole("button", { name: "Expand" }).click()
  const opening = await sample(page, 700, () => frame(page))

  for (const read of [...closing, ...opening]) {
    expect(read.edges).toBe(3)
    // Exactly one handle per id in every frame: never zero, never two.
    expect(read.ports).toEqual([1, 1, 1])
  }
  await expect(page.locator(ROWS)).toHaveCount(3)
  const reopened = await centers(page)
  const rows = await rectsOf(page, ROWS)
  for (const [index, port] of reopened.ports.entries()) {
    expect(Math.abs(port.y - (rows[index].y + rows[index].height / 2))).toBeLessThanOrEqual(1)
  }
})
