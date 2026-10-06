import { expect, test, type Page } from "@playwright/test"

import { rectsOf } from "./helpers/motion"

const edges = (page: Page) => page.getByTestId("edges")
const ring = (page: Page) => page.locator('[data-slot="flow-drop-target"]')

function port(page: Page, nodeId: string, handleId: string) {
  return page.locator(`.react-flow__handle[data-nodeid="${nodeId}"][data-handleid="${handleId}"]`)
}

async function centerOf(page: Page, selector: string) {
  const box = await page.locator(selector).boundingBox()
  if (!box) throw new Error(`${selector} has no box`)
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
}

/** Drags from a port to the middle of a node and holds there, before the release. */
async function dragPortOverNode(
  page: Page,
  from: { nodeId: string; handleId: string },
  to: string,
) {
  const start = await port(page, from.nodeId, from.handleId).boundingBox()
  if (!start) throw new Error("port has no box")
  const end = await centerOf(page, `.react-flow__node[data-id="${to}"]`)
  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2)
  await page.mouse.down()
  await page.mouse.move(end.x, end.y, { steps: 12 })
}

test.describe("FlowCanvas connectOnNodeDrop", () => {
  let errors: string[]

  test.beforeEach(async ({ page }) => {
    errors = []
    page.on("pageerror", (error) => errors.push(String(error)))
    page.on("console", (message) => message.type() === "error" && errors.push(message.text()))
    await page.goto("/e2e/fixtures/connect-on-node-drop.html")
    await expect(edges(page)).toHaveText("other:out->merge:a")
  })

  test.afterEach(() => {
    expect(errors).toEqual([])
  })

  test("dropping on a node body connects to its first free input", async ({ page }) => {
    await dragPortOverNode(page, { nodeId: "decision", handleId: "out" }, "merge")

    await expect(ring(page)).toHaveCount(1)
    await expect(ring(page)).toHaveAttribute("data-node-id", "merge")
    // One read, so the node and the ring come from the same frame.
    const [node, box] = await rectsOf(
      page,
      '.react-flow__node[data-id="merge"], [data-slot="flow-drop-target"]',
    )
    expect(box.x).toBeLessThan(node.x)
    expect(box.y).toBeLessThan(node.y)
    expect(box.x + box.width).toBeGreaterThan(node.x + node.width)
    expect(box.y + box.height).toBeGreaterThan(node.y + node.height)
    const color = await ring(page).evaluate((element) => getComputedStyle(element).boxShadow)
    const accent = await page.evaluate(() => {
      const probe = document.createElement("div")
      probe.style.color = "var(--gc-accent)"
      document.body.append(probe)
      const value = getComputedStyle(probe).color
      probe.remove()
      return value
    })
    expect(color).toContain(accent)

    await page.mouse.up()

    await expect(edges(page)).toHaveText("other:out->merge:a decision:out->merge:b")
    await expect(ring(page)).toHaveCount(0)
    await expect(page.getByTestId("connect-ends")).toHaveText("1")
  })

  test("dragging from an input connects the dropped node's output to it", async ({ page }) => {
    await dragPortOverNode(page, { nodeId: "merge", handleId: "b" }, "decision")
    await expect(ring(page)).toHaveAttribute("data-node-id", "decision")
    await page.mouse.up()

    await expect(edges(page)).toHaveText("other:out->merge:a decision:out->merge:b")
  })

  test("a target that isValidConnection rejects gets no ring and no edge", async ({ page }) => {
    await dragPortOverNode(page, { nodeId: "decision", handleId: "out" }, "blocked")
    // Wait 2 frames so a ring would have rendered.
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    )
    await expect(ring(page)).toHaveCount(0)
    await page.mouse.up()

    await expect(page.getByTestId("connect-ends")).toHaveText("1")
    await expect(edges(page)).toHaveText("other:out->merge:a")
  })

  test("a port id with quotes connects without a selector error", async ({ page }) => {
    await dragPortOverNode(page, { nodeId: "decision", handleId: "out" }, "quoted")
    await expect(ring(page)).toHaveAttribute("data-node-id", "quoted")
    await page.mouse.up()

    await expect(edges(page)).toHaveText('other:out->merge:a decision:out->quoted:say "hi"')
  })

  test("a node without a free input gets no ring and no edge", async ({ page }) => {
    await dragPortOverNode(page, { nodeId: "decision", handleId: "out" }, "merge")
    await page.mouse.up()
    await expect(edges(page)).toHaveText("other:out->merge:a decision:out->merge:b")

    await dragPortOverNode(page, { nodeId: "other", handleId: "out" }, "merge")
    await expect(ring(page)).toHaveCount(0)
    await page.mouse.up()

    await expect(edges(page)).toHaveText("other:out->merge:a decision:out->merge:b")
  })
})
