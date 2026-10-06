import { expect, test, type Page } from "@playwright/test"

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

const TEXT = "Opens the inventory and adds the item."

function scriptNode(page: Page) {
  return page.locator(".react-flow__node", { hasText: "Amend Inventory" })
}

async function selectScriptNode(page: Page) {
  const node = scriptNode(page)
  await node.locator('[data-slot="node-header"]').click({ position: { x: 60, y: 10 } })
  await expect(node).toHaveClass(/selected/)
  return node
}

test("Backspace in the textarea of a selected node edits the text, not the node", async ({
  page,
}) => {
  const node = await selectScriptNode(page)
  const note = node.getByRole("textbox", { name: "Note" })
  await note.focus()
  await page.keyboard.press("ControlOrMeta+End")
  await page.keyboard.type(" Twice.")
  await expect(node).toHaveClass(/selected/)

  await page.keyboard.press("Backspace")
  await page.keyboard.press("Backspace")

  await expect(note).toHaveValue(`${TEXT} Twic`)
  await expect(page.locator(".react-flow__node")).toHaveCount(4)
  await expect(node).toBeVisible()
})

test("selecting text in the textarea does not drag the node", async ({ page }) => {
  const node = scriptNode(page)
  const note = node.getByRole("textbox", { name: "Note" })
  const before = (await node.boundingBox())!
  const box = (await note.boundingBox())!

  // The node reaches past the right edge of the window; stay inside the visible part.
  await page.mouse.move(box.x + 8, box.y + 10)
  await page.mouse.down()
  await page.mouse.move(box.x + 40, box.y + 24, { steps: 8 })
  await page.mouse.move(box.x + 70, box.y + 26, { steps: 8 })
  await page.mouse.up()

  const after = (await node.boundingBox())!
  expect({ x: after.x, y: after.y }).toEqual({ x: before.x, y: before.y })
  const selected = await note.evaluate(
    (field: HTMLTextAreaElement) => field.selectionEnd - field.selectionStart,
  )
  expect(selected).toBeGreaterThan(0)
})

test("the wheel over a full textarea scrolls it, not the canvas", async ({ page }) => {
  const node = scriptNode(page)
  const note = node.getByRole("textbox", { name: "Note" })
  await note.fill(Array.from({ length: 12 }, (_, i) => `Line ${i + 1}`).join("\n"))
  await expect(note).toHaveCSS("overflow-y", "auto")
  await note.evaluate((field) => (field.scrollTop = 0))

  const viewport = page.locator(".react-flow__viewport")
  const before = await viewport.getAttribute("style")
  // The node reaches past the right edge of the window; aim inside the visible part.
  const box = (await note.boundingBox())!
  await page.mouse.move(box.x + 20, box.y + 20)
  await page.mouse.wheel(0, 200)

  await expect.poll(() => note.evaluate((field) => field.scrollTop)).toBeGreaterThan(0)
  expect(await viewport.getAttribute("style")).toBe(before)
})

test("the input of a selected node takes Backspace and arrow keys", async ({ page }) => {
  const node = page.locator(".react-flow__node", { hasText: "Add Item" })
  await node.locator('[data-slot="node-header"]').click({ position: { x: 60, y: 10 } })
  await expect(node).toHaveClass(/selected/)
  const before = (await node.boundingBox())!

  const tag = node.getByRole("textbox", { name: "Tag" })
  await tag.focus()
  for (const key of ["End", "ArrowLeft", "Backspace", "ArrowRight", "ArrowUp"]) {
    await page.keyboard.press(key)
  }

  await expect(tag).toHaveValue("Lot")
  await expect(page.locator(".react-flow__node")).toHaveCount(4)
  const after = (await node.boundingBox())!
  expect({ x: after.x, y: after.y }).toEqual({ x: before.x, y: before.y })
})
