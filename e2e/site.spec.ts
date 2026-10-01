import { expect, test } from "@playwright/test"

import manifest from "../registry.json" with { type: "json" }

let errors: string[] = []

test.beforeEach(async ({ page }) => {
  // The listing badge image is third-party; tests do not depend on its host.
  await page.route("https://usefulshelf.co/**", (route) =>
    route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg"/>',
    }),
  )
  errors = []
  page.on("pageerror", (error) => errors.push(String(error)))
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()))
})

test.afterEach(() => {
  expect(errors).toEqual([])
})

const pages = manifest.items
  .filter((item) => item.type !== "registry:file" && item.type !== "registry:hook")
  .map((item) => item.name)

test("the landing page shows a live canvas and an install command", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Components for node canvases")
  await expect(page.locator(".react-flow__node")).toHaveCount(4)
  await expect(page.locator('[data-slot="command"] code')).toContainText("r/event-flow.json")
  await page.screenshot({ path: "verify/artifacts/site-home.png", fullPage: true })
})

test("the copy button copies the install command", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"])
  await page.goto("/")
  const command = page.locator('[data-slot="command"]').first()
  await command.getByRole("tab", { name: "npm", exact: true }).click()
  await command.getByRole("button", { name: "Copy command" }).click()
  await expect(command.getByRole("button", { name: "Copied" })).toBeVisible()
  const copied = await page.evaluate(() => navigator.clipboard.readText())
  expect(copied).toMatch(/^npx shadcn@latest add https:\/\/.+\/r\/event-flow\.json$/)
})

for (const name of pages) {
  test(`the ${name} page shows a live preview and its code`, async ({ page }) => {
    await page.goto(`/docs/components/${name}`)
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
    await expect(page.locator('[data-slot="canvas-frame"] .react-flow__node').first()).toBeVisible()
    await expect(page.locator('[data-slot="command"] code')).toContainText(`r/${name}.json`)

    await page.getByRole("tab", { name: "Code" }).click()
    await expect(page.locator('[data-slot="preview"] .shiki')).toContainText("export default")
    await expect(page.locator('[data-slot="preview"] .shiki')).not.toContainText("@/registry/")
  })
}

test("the manual tab shows the source with user import paths", async ({ page }) => {
  await page.goto("/docs/components/node-select")
  await page.getByRole("tab", { name: "Manual" }).click()
  const source = page.locator('[data-slot="code-block"]', {
    hasText: "components/ui/node-select.tsx",
  })
  await expect(source).toContainText("@/hooks/use-controllable-state")
  await expect(source).not.toContainText("@/registry/")
})

test("the sidebar navigates without a page load", async ({ page }) => {
  await page.goto("/docs")
  await page.evaluate(() => ((window as unknown as { marker: boolean }).marker = true))
  await page
    .getByRole("navigation", { name: "Docs" })
    .getByRole("link", { name: "Node Stepper" })
    .click()
  await expect(page).toHaveURL(/\/docs\/components\/node-stepper$/)
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Node Stepper")
  expect(await page.evaluate(() => (window as unknown as { marker?: boolean }).marker)).toBe(true)
})

test("the wheel scrolls the page over a preview", async ({ page }) => {
  await page.goto("/docs/components/node-card")
  const frame = page.locator('[data-slot="canvas-frame"]')
  const viewport = frame.locator(".react-flow__viewport")
  const before = await viewport.getAttribute("style")
  await frame.hover()
  await page.mouse.wheel(0, 400)
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
  expect(await viewport.getAttribute("style")).toBe(before)
})

test("the theme toggle switches to light and remembers it", async ({ page }) => {
  await page.goto("/docs")
  await page.getByRole("button", { name: "Use light theme" }).click()
  await expect(page.locator("html")).not.toHaveClass(/dark/)
  await page.reload()
  await expect(page.locator("html")).not.toHaveClass(/dark/)
  await page.goto("/docs/components/node-card")
  await page.screenshot({ path: "verify/artifacts/site-node-card-light.png", fullPage: true })
})

test("an unknown docs path shows the not found page", async ({ page }) => {
  await page.goto("/docs/components/nothing")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Page not found")
})

test("the server sends each route with its own head tags", async ({ request }) => {
  const html = await (await request.get("/docs/components/node-select")).text()
  expect(html).toContain("<title>Node Select – GraphComp</title>")
  expect(html).toMatch(
    /<meta property="og:image" content="https:\/\/[^"]+\/og\/node-select\.png" \/>/,
  )
})

test("client navigation updates the title, description and canonical link", async ({ page }) => {
  await page.goto("/docs")
  await page
    .getByRole("navigation", { name: "Docs" })
    .getByRole("link", { name: "Theming" })
    .click()
  await expect(page).toHaveTitle("Theming – GraphComp")
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/docs\/theming$/)
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    /\/og\/docs-theming\.png$/,
  )
  await expect(page.locator('meta[name="description"]')).toHaveCount(1)
})

test("a preview plays by itself until the user presses inside it", async ({ page }) => {
  await page.goto("/docs/components/node-segmented")
  const frame = page.locator('[data-slot="canvas-frame"]')
  await expect(frame).toHaveAttribute("data-autoplay", "playing")
  await expect(frame.getByRole("radio", { name: "Record" })).toHaveAttribute(
    "aria-checked",
    "true",
    {
      timeout: 8000,
    },
  )

  await frame.locator(".react-flow__pane").click({ position: { x: 20, y: 20 } })
  await expect(frame).toHaveAttribute("data-autoplay", "paused")
  await frame.getByRole("button", { name: "Play demo" }).click()
  await expect(frame).toHaveAttribute("data-autoplay", "playing")
})

test("autoplay drags a connection between two ports", async ({ page }) => {
  await page.goto("/docs/components/node-port")
  const frame = page.locator('[data-slot="canvas-frame"]')
  await expect(frame.locator('[data-slot="flow-edge"]')).toHaveCount(1, { timeout: 8000 })
})

test("reduced motion starts the previews paused", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/")
  const frame = page.locator('[data-slot="canvas-frame"]')
  await expect(frame).toHaveAttribute("data-autoplay", "paused")
  await expect(frame.getByRole("button", { name: "Play demo" })).toBeVisible()
})

test("the footer carries the UsefulShelf badge as a followed link", async ({ page }) => {
  await page.goto("/docs")
  const badge = page.locator('footer a[href^="https://usefulshelf.co/"]')
  await expect(badge.getByRole("img", { name: "Featured on UsefulShelf" })).toBeVisible()
  await expect(badge).toHaveAttribute("rel", "noopener")
})
