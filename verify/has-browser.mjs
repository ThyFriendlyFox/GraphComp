// Exits 0 when Playwright can launch Chromium, 1 otherwise.
import { existsSync } from "node:fs"
import { chromium } from "@playwright/test"

const path = process.env.CHROMIUM_PATH || chromium.executablePath()
process.exit(path && existsSync(path) ? 0 : 1)
