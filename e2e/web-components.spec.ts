import { expect, test, type Page } from "@playwright/test"

let errors: string[] = []

test.beforeEach(async ({ page }) => {
  errors = []
  page.on("pageerror", (error) => errors.push(String(error)))
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()))
  await page.goto("/wc/example.html")
  await expect(page.locator("gc-flow-canvas .react-flow__node")).toHaveCount(4)
  // Record every GraphComp event the element fires, with its detail.
  await page.evaluate(() => {
    const events: { type: string; detail: unknown }[] = []
    ;(window as unknown as { gcEvents: typeof events }).gcEvents = events
    for (const type of ["gc-nodes-change", "gc-edges-change", "gc-connect"]) {
      document.addEventListener(type, (event) =>
        events.push({ type, detail: (event as CustomEvent).detail }),
      )
    }
  })
})

test.afterEach(() => {
  expect(errors).toEqual([])
})

type Recorded = { type: string; detail: Record<string, unknown> }

function recorded(page: Page, type: string) {
  return page.evaluate(
    (type) =>
      (window as unknown as { gcEvents: Recorded[] }).gcEvents.filter(
        (event) => event.type === type,
      ),
    type,
  )
}

function node(page: Page, id: string) {
  return page.locator(`gc-flow-canvas .react-flow__node[data-id="${id}"]`)
}

async function center(locator: ReturnType<Page["locator"]>) {
  const box = (await locator.boundingBox())!
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
}

test("renders the nodes and edges from the JSON child script", async ({ page }) => {
  const canvas = page.locator("gc-flow-canvas")
  await expect(canvas.getByText("Webhook")).toBeVisible()
  await expect(canvas.getByText("Send Email")).toBeVisible()
  await expect(canvas.locator('[data-slot="flow-edge"]')).toHaveCount(2)
  expect(await canvas.evaluate((element) => element.shadowRoot !== null)).toBe(true)
  await page.screenshot({ path: "verify/artifacts/web-components.png" })
})

test("dragging a node fires gc-nodes-change and updates el.nodes", async ({ page }) => {
  const header = node(page, "archive").locator('[data-slot="node-header"]')
  const start = await center(header)
  await page.mouse.move(start.x, start.y)
  await page.mouse.down()
  await page.mouse.move(start.x + 60, start.y + 40, { steps: 8 })
  await page.mouse.up()

  await expect
    .poll(async () =>
      (await recorded(page, "gc-nodes-change")).some((event) =>
        (event.detail.changes as { type: string; id: string }[]).some(
          (change) => change.type === "position" && change.id === "archive",
        ),
      ),
    )
    .toBe(true)
  const position = await page.evaluate(() => {
    const element = document.querySelector("gc-flow-canvas") as unknown as {
      nodes: { id: string; position: { x: number; y: number } }[]
    }
    return element.nodes.find((entry) => entry.id === "archive")!.position
  })
  expect(position.x).toBeGreaterThan(600)
  expect(position.y).toBeGreaterThan(160)
})

test("dragging from a port to a port fires gc-connect and draws the edge", async ({ page }) => {
  const from = await center(node(page, "filter").locator(".react-flow__handle.source"))
  const to = await center(node(page, "archive").locator(".react-flow__handle.target"))
  await page.mouse.move(from.x, from.y)
  await page.mouse.down()
  await page.mouse.move(to.x, to.y, { steps: 12 })
  await page.mouse.up()

  await expect(page.locator('gc-flow-canvas [data-slot="flow-edge"]')).toHaveCount(3)
  const connects = await recorded(page, "gc-connect")
  expect(connects).toHaveLength(1)
  expect(connects[0].detail.connection).toMatchObject({ source: "filter", target: "archive" })
  expect(connects[0].detail.edges).toHaveLength(3)
  await expect(page.locator("#log")).toHaveText("gc-connect")
})

test("a select opens and picks inside the shadow root", async ({ page }) => {
  const trigger = node(page, "email").getByRole("combobox", { name: "Trigger" })
  await trigger.click()
  await expect(node(page, "email").getByRole("listbox")).toBeVisible()

  // The document sees the shadow host as the target of a press inside it.
  // A press on an option must not count as a press outside the select.
  const option = await center(node(page, "email").getByRole("option", { name: "Open Map" }))
  await page.mouse.move(option.x, option.y)
  await page.mouse.down()
  await expect(trigger).toHaveAttribute("aria-expanded", "true")
  await page.mouse.up()
  await expect(trigger).toHaveText("Open Map")
})

test("setting el.nodes replaces the nodes", async ({ page }) => {
  await page.getByRole("button", { name: "Add node" }).click()
  await expect(page.locator("gc-flow-canvas .react-flow__node")).toHaveCount(5)
  await expect(page.locator("gc-flow-canvas").getByText("New Step")).toBeVisible()
})

test("follows the page's dark class and takes tokens from the page", async ({ page }) => {
  const token = (name: string) =>
    page.evaluate((name) => {
      const flow = document
        .querySelector("gc-flow-canvas")!
        .shadowRoot!.querySelector(".react-flow")!
      return getComputedStyle(flow).getPropertyValue(name).trim()
    }, name)

  expect(await token("--gc-canvas")).toBe("#1b1a1d")
  await page.getByRole("button", { name: "Toggle dark" }).click()
  await expect.poll(() => token("--gc-canvas")).toBe("#f4f4f5")

  // A value set on the element wins over the built-in token, in both modes.
  await page.getByRole("button", { name: "Toggle accent" }).click()
  expect(await token("--gc-accent")).toBe("#f97316")
  await page.getByRole("button", { name: "Toggle dark" }).click()
  await expect.poll(() => token("--gc-canvas")).toBe("#1b1a1d")
  expect(await token("--gc-accent")).toBe("#f97316")

  await page.locator("gc-flow-canvas").evaluate((element) => element.setAttribute("theme", "light"))
  await expect.poll(() => token("--gc-canvas")).toBe("#f4f4f5")
})
