import { expect, test } from "@playwright/test"

let errors: string[] = []

test.beforeEach(async ({ page }) => {
  errors = []
  page.on("pageerror", (error) => errors.push(String(error)))
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()))
  await page.goto("/")
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
