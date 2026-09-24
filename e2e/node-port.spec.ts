import { expect, test } from "@playwright/test"

test("renaming a port keeps its edge connected on a fixed-size node", async ({ page }) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(String(error)))
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()))

  await page.goto("/e2e/fixtures/node-port.html")

  const edge = page.locator('[data-slot="flow-edge"] path.react-flow__edge-path')
  const sourceNode = page.locator('.react-flow__node[data-id="decision"]')

  await expect(edge).toHaveCount(1)
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  )

  const originalBounds = await sourceNode.boundingBox()
  const originalCount = await edge.count()
  await expect(page.locator('[data-handleid="answer:Yes"]')).toBeVisible()
  await page.getByRole("button", { name: "Rename answer" }).click()
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())))

  await expect(page.locator('[data-handleid="answer:Up"]')).toBeVisible()
  await expect(page.locator('[data-handleid="answer:Yes"]')).toHaveCount(0)
  await expect(edge).toHaveCount(originalCount)

  const nextBounds = await sourceNode.boundingBox()
  expect(nextBounds).toEqual(originalBounds)
  expect(errors).toEqual([])
})
