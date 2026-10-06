import { expect, test } from "@playwright/test"

let errors: string[] = []

test.beforeEach(async ({ page }) => {
  errors = []
  page.on("pageerror", (error) => errors.push(String(error)))
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()))
  await page.goto("/playground/")
  await expect(page.locator(".react-flow__node")).toHaveCount(4)
})

test.afterEach(() => {
  expect(errors).toEqual([])
})

test("renders the event flow with its edges", async ({ page }) => {
  await expect(page.getByText("On Mouse Down")).toBeVisible()
  await expect(page.getByText("Amend Inventory")).toBeVisible()
  await expect(page.locator('[data-slot="flow-edge"]')).toHaveCount(3)
  await page.screenshot({ path: "verify/artifacts/event-flow.png" })
})

test("opening a trigger pushes the card below it down", async ({ page }) => {
  const below = page.locator('[data-slot="node-card"]', { hasText: "On Key Press" })
  const before = await below.boundingBox()

  await page.getByRole("button", { name: "Expand" }).first().click()
  await expect(page.getByRole("radiogroup", { name: "Mode" })).toBeVisible()
  await expect(async () => {
    const after = await below.boundingBox()
    expect(after!.y - before!.y).toBeGreaterThan(100)
  }).toPass()
  await page.screenshot({ path: "verify/artifacts/event-flow-open.png" })
})

test("the select opens inside the node and picks with the keyboard", async ({ page }) => {
  await page.getByRole("button", { name: "Expand" }).first().click()
  const trigger = page.getByRole("combobox", { name: "Trigger" }).first()
  await trigger.click()
  await expect(page.getByRole("listbox")).toBeVisible()
  await page.keyboard.press("ArrowDown")
  await page.keyboard.press("Enter")
  await expect(trigger).toHaveText("Open Node")
})

test("the zoom control changes the zoom level", async ({ page }) => {
  const level = page.locator('[data-slot="flow-zoom-control"] [aria-live]')
  const before = await level.textContent()
  await page.getByRole("button", { name: "Zoom out" }).click()
  await expect(level).not.toHaveText(before!)
})

test("widget keys do not move or delete the node", async ({ page }) => {
  await page.getByRole("button", { name: "Expand" }).first().click()
  const node = page.locator(".react-flow__node", { hasText: "On Mouse Down" })
  const before = await node.boundingBox()

  const spin = page.getByRole("spinbutton", { name: "Sensitivity" })
  await spin.click()
  for (const key of ["ArrowUp", "ArrowUp", "ArrowLeft", "Backspace"]) await page.keyboard.press(key)
  await expect(spin).toHaveAttribute("aria-valuenow", "54")

  await page.getByRole("radio", { name: "Trigger" }).focus()
  await page.keyboard.press("ArrowRight")
  await expect(page.getByRole("radio", { name: "Record" })).toHaveAttribute("aria-checked", "true")

  await expect(node).toBeVisible()
  const after = await node.boundingBox()
  expect({ x: after!.x, y: after!.y }).toEqual({ x: before!.x, y: before!.y })
})

test("the edge style control changes every edge and the drag line", async ({ page }) => {
  const port = page.locator('[data-handleid="key-press-out"]')
  async function dragLine() {
    const from = (await port.boundingBox())!
    await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2)
    await page.mouse.down()
    await page.mouse.move(from.x + 160, from.y + 140, { steps: 8 })
    const d = await page.locator("path.react-flow__connection-path").getAttribute("d")
    await page.mouse.up()
    return d
  }

  expect(await dragLine()).not.toMatch(/C/)

  await page.getByRole("radio", { name: "Curve" }).click()
  await expect(page.locator('[data-slot="flow-bezier-edge"]')).toHaveCount(3)
  await expect(page.locator('[data-slot="flow-edge"]')).toHaveCount(0)
  expect(await dragLine()).toMatch(/C/)

  await page.getByRole("radio", { name: "Straight" }).click()
  await expect(page.locator('[data-slot="flow-straight-edge"]')).toHaveCount(3)
  expect(await dragLine()).toMatch(/^M[^A-Za-z]+L[^A-Za-z]+$/)

  await page.getByRole("radio", { name: "Angle" }).click()
  await expect(page.locator('[data-slot="flow-edge"]')).toHaveCount(3)
})
