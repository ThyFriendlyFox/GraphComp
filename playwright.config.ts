import { defineConfig, devices } from "@playwright/test"

// CHROMIUM_PATH points at a pre-installed Chromium when the Playwright
// browser download is unavailable (for example in sandboxed agents).
const executablePath = process.env.CHROMIUM_PATH || undefined

export default defineConfig({
  testDir: "e2e",
  outputDir: "test-results",
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:4173",
    ...devices["Desktop Chrome"],
    viewport: { width: 1400, height: 900 },
    launchOptions: { executablePath },
  },
  webServer: {
    command: "pnpm vite --port 4173 --strictPort",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
  },
})
