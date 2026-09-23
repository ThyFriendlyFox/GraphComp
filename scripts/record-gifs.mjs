// Records the README GIFs from the live playground.
//
// Frames are captured on Playwright's fake clock: each frame advances
// requestAnimationFrame and performance.now by exactly 1000 / FPS ms, so
// Motion springs and React Flow transitions render every frame, however
// slow the screenshot is. 50 fps is the GIF ceiling: browsers slow any
// frame delay under 2 centiseconds down to 10.
//
// Needs Chromium (CHROMIUM_PATH or a Playwright download) and ffmpeg
// (FFMPEG_PATH or `ffmpeg` on PATH).
//
//   pnpm gifs            # all clips
//   pnpm gifs widgets    # one clip

import { spawnSync } from "node:child_process"
import { mkdirSync, rmSync, statSync } from "node:fs"
import { join } from "node:path"
import { chromium } from "@playwright/test"
import { createServer } from "vite"

const FPS = 50
const FRAME_MS = 1000 / FPS
const SCALE = 2
const OUT_DIR = ".github/assets"
const FRAMES_DIR = "node_modules/.tmp/gif-frames"
const FFMPEG = process.env.FFMPEG_PATH || "ffmpeg"

// A drawn cursor with a click ring. Headless screenshots have no cursor.
const cursorScript = () => {
  addEventListener("DOMContentLoaded", () => {
    const cursor = document.createElement("div")
    cursor.innerHTML = `
      <div data-ring style="position:absolute;left:-14px;top:-14px;width:28px;height:28px;border-radius:50%;
        background:rgb(41 155 237 / .35);transform:scale(0);transition:none"></div>
      <svg width="22" height="22" viewBox="0 0 24 24" style="position:absolute;left:-3px;top:-2px;
        filter:drop-shadow(0 2px 3px rgb(0 0 0 / .5))">
        <path d="M4 2.5 20 13l-7.2 1.4L8.6 21z" fill="#fff" stroke="#111" stroke-width="1.4" stroke-linejoin="round"/>
      </svg>`
    Object.assign(cursor.style, {
      position: "fixed",
      left: "-100px",
      top: "-100px",
      zIndex: "2147483647",
      pointerEvents: "none",
    })
    document.body.append(cursor)
    const ring = cursor.querySelector("[data-ring]")
    addEventListener(
      "mousemove",
      (e) => {
        cursor.style.left = `${e.clientX}px`
        cursor.style.top = `${e.clientY}px`
      },
      true,
    )
    addEventListener("mousedown", () => (ring.style.transform = "scale(1)"), true)
    addEventListener("mouseup", () => (ring.style.transform = "scale(0.6)"), true)
    window.__gcHideRing = () => (ring.style.transform = "scale(0)")
  })
}

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

function recorder(page, name, clip) {
  const dir = join(FRAMES_DIR, name)
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })
  let frame = 0
  let mouse = { x: clip.x + clip.width / 2, y: clip.y + clip.height + 40 }

  async function shoot() {
    await page.clock.runFor(FRAME_MS)
    await page.screenshot({
      path: join(dir, `${String(frame++).padStart(5, "0")}.png`),
      clip,
    })
  }

  const r = {
    async hold(ms) {
      for (let i = 0; i < Math.round(ms / FRAME_MS); i++) await shoot()
    },
    async moveTo(target, ms = 500) {
      const box = typeof target.boundingBox === "function" ? await target.boundingBox() : target
      const to = box.width ? { x: box.x + box.width / 2, y: box.y + box.height / 2 } : box
      const from = { ...mouse }
      const steps = Math.max(1, Math.round(ms / FRAME_MS))
      for (let i = 1; i <= steps; i++) {
        const t = ease(i / steps)
        mouse = { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t }
        await page.mouse.move(mouse.x, mouse.y)
        await shoot()
      }
    },
    async click(target, { move = 450, after = 400 } = {}) {
      if (target) await r.moveTo(target, move)
      await page.mouse.down()
      await r.hold(80)
      await page.mouse.up()
      await r.hold(120)
      await page.evaluate(() => window.__gcHideRing?.())
      await r.hold(after)
    },
    async drag(target, dx, dy, ms = 900) {
      await r.moveTo(target, 450)
      await page.mouse.down()
      await r.hold(100)
      const start = { ...mouse }
      await r.moveTo({ x: start.x + dx, y: start.y + dy }, ms)
      await page.mouse.up()
      await r.hold(150)
    },
    async key(key, after = 250) {
      await page.keyboard.press(key)
      await r.hold(after)
    },
    frames: () => frame,
    dir,
  }
  return r
}

async function open(browser, url) {
  const page = await browser.newPage({
    viewport: { width: 1400, height: 900 },
    deviceScaleFactor: SCALE,
  })
  await page.addInitScript(cursorScript)
  // Motion hands some opacity tweens to the Web Animations API, which runs
  // on the compositor clock, not the fake one. Without it, Motion animates
  // everything in its frame loop, so every fade is frame-exact too.
  await page.addInitScript(() => delete Element.prototype.animate)
  // Paused: time moves only when a frame is shot, so the recording is exact
  // even though each screenshot takes longer than a frame.
  await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") })
  await page.clock.pauseAt(new Date("2026-01-01T00:00:01Z"))
  await page.goto(url)
  await page.locator(".react-flow__node").first().waitFor()
  return page
}

const clips = {
  // The whole flow: edges draw in, a trigger opens and pushes its neighbour,
  // widgets change, the node closes, the canvas zooms.
  async "event-flow"(browser, url) {
    const page = await open(browser, url)
    const main = await page.locator("main").boundingBox()
    const rec = recorder(page, "event-flow", main)
    await rec.hold(1100)
    await rec.click(page.getByRole("button", { name: "Expand" }).first(), { after: 700 })
    await rec.click(page.getByRole("radio", { name: "Record" }), { after: 350 })
    await rec.click(page.getByRole("radio", { name: "Trigger" }), { after: 350 })
    await rec.click(page.getByRole("combobox", { name: "Trigger" }).first(), { after: 300 })
    await rec.click(page.getByRole("option", { name: "Open Node" }), { move: 350, after: 400 })
    const plus = page
      .locator('[data-slot="node-stepper"]')
      .nth(1)
      .getByRole("button", { name: "Increase" })
    await rec.moveTo(plus, 450)
    for (let i = 0; i < 4; i++) await rec.click(null, { after: 60 })
    await rec.hold(300)
    await rec.click(page.locator('[data-slot="node-grip"]').first(), { after: 700 })
    await rec.click(page.getByRole("button", { name: "Zoom out" }), { after: 600 })
    await rec.click(page.getByRole("button", { name: "Zoom in" }), { after: 900 })
    await page.close()
    return { rec, width: 960 }
  },

  // A close-up of one node's widgets, driven by mouse and keyboard.
  async widgets(browser, url) {
    const page = await open(browser, url)
    await page.getByRole("button", { name: "Expand" }).first().click()
    await page.clock.runFor(1000)
    await page.mouse.move(0, 0)
    const card = await page.locator('[data-slot="node-card"]').first().boundingBox()
    const pad = 36
    const clip = {
      x: card.x - pad - 8,
      y: card.y - pad,
      width: card.width + pad * 2 + 16,
      height: card.height + pad * 2 + 170,
    }
    const rec = recorder(page, "widgets", clip)
    await rec.hold(300)
    await rec.click(page.getByRole("radio", { name: "Record" }), { after: 450 })
    await rec.click(page.getByRole("radio", { name: "Trigger" }), { after: 450 })
    await rec.click(page.getByRole("combobox", { name: "Trigger" }).first(), { after: 250 })
    await rec.moveTo(page.getByRole("option", { name: "Open Node" }), 300)
    await rec.hold(150)
    await rec.moveTo(page.getByRole("option", { name: "Push Action" }), 250)
    await rec.click(page.getByRole("option", { name: "Open Node" }), { move: 250, after: 450 })
    const delay = page.locator('[data-slot="node-stepper"]').first()
    await rec.click(delay.getByRole("button", { name: "Increase" }), { after: 120 })
    await rec.click(null, { after: 120 })
    await rec.click(null, { after: 300 })
    await rec.click(delay.getByRole("button", { name: "Decrease" }), { move: 250, after: 350 })
    const sensitivity = page.locator('[data-slot="node-stepper"]').nth(1)
    await rec.click(sensitivity.getByRole("spinbutton"), { after: 150 })
    for (let i = 0; i < 6; i++) await rec.key("ArrowUp", 90)
    await rec.key("PageDown", 400)
    await rec.click(page.getByRole("combobox", { name: "Trigger" }).first(), { after: 250 })
    await rec.key("ArrowDown", 200)
    await rec.key("ArrowUp", 200)
    await rec.key("Enter", 500)
    await rec.click(page.locator('[data-slot="node-grip"]').first(), { after: 600 })
    await rec.click(page.getByRole("button", { name: "Expand" }).first(), { after: 700 })
    await page.close()
    return { rec, width: 520 }
  },

  // Dragging nodes: edges re-route and keep their rounded corners.
  async edges(browser, url) {
    const page = await open(browser, url)
    await page.clock.runFor(1000)
    const main = await page.locator("main").boundingBox()
    const clip = { x: main.x, y: main.y + 40, width: main.width, height: main.height - 40 }
    const rec = recorder(page, "edges", clip)
    await rec.hold(300)
    const inventory = page.locator(".react-flow__node", { hasText: "Amend Inventory" })
    const header = inventory.locator('[data-slot="node-title"]').first()
    await rec.drag(header, 170, 60, 1000)
    await rec.hold(200)
    await rec.drag(header, -170, -60, 1000)
    await rec.hold(200)
    const item = page
      .locator(".react-flow__node", { hasText: "Add Item" })
      .locator('[data-slot="node-title"]')
    await rec.drag(item, -330, 140, 1000)
    await rec.hold(200)
    await rec.drag(item, 330, -140, 900)
    await rec.hold(200)
    await rec.drag(header, -40, -40, 700)
    await rec.hold(600)
    await page.close()
    return { rec, width: 960 }
  },
}

function encode(name, rec, width) {
  const out = join(OUT_DIR, `${name}.gif`)
  // One palette per clip, built from the frames' differences, then Bayer
  // dithering: stable across frames, so flat surfaces do not shimmer.
  const filter =
    `fps=${FPS},scale=${width}:-1:flags=lanczos,split[a][b];` +
    `[a]palettegen=max_colors=256:stats_mode=diff[p];` +
    `[b][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle`
  const result = spawnSync(
    FFMPEG,
    [
      "-y",
      "-loglevel",
      "error",
      "-framerate",
      String(FPS),
      "-i",
      join(rec.dir, "%05d.png"),
      "-filter_complex",
      filter,
      "-loop",
      "0",
      out,
    ],
    { stdio: "inherit" },
  )
  if (result.status !== 0) throw new Error(`ffmpeg failed for ${name}`)
  const mb = (statSync(out).size / 1024 / 1024).toFixed(1)
  console.log(`${out}: ${rec.frames()} frames, ${(rec.frames() / FPS).toFixed(1)} s, ${mb} MB`)
}

const only = process.argv.slice(2)
const server = await createServer({ server: { port: 4180, strictPort: true }, logLevel: "error" })
await server.listen()
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined })
try {
  mkdirSync(OUT_DIR, { recursive: true })
  for (const [name, record] of Object.entries(clips)) {
    if (only.length && !only.includes(name)) continue
    const { rec, width } = await record(browser, "http://localhost:4180/")
    encode(name, rec, width)
  }
} finally {
  await browser.close()
  await server.close()
}
