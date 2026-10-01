// Renders the site icons and one Open Graph image per page into public/.
//
//   pnpm assets            # everything
//   pnpm assets icons      # icons only
//   pnpm assets og         # OG images only
//
// The OG images show a screenshot of each page's live preview, so the
// script runs the Vite dev server and drives it with Playwright.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { createRequire } from "node:module"
import { chromium } from "@playwright/test"
import { createServer } from "vite"

const require = createRequire(import.meta.url)
const PUBLIC = new URL("../public/", import.meta.url)
const PORT = 4181
const ORIGIN = `http://localhost:${PORT}`

const color = {
  canvas: "#1b1a1d",
  grid: "#252428",
  node: "#333333",
  header: "#3c3c3c",
  border: "#444446",
  fg: "#ececec",
  muted: "#8e8e93",
  accent: "#299bed",
  edge: "#9a9a9e",
}

// The mark: the entry point of a flow, an accent dot in a dark halo.
const markSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <circle cx="16" cy="16" r="15" fill="${color.header}"/>
  <circle cx="16" cy="16" r="8.5" fill="${color.accent}"/>
</svg>
`

// The app icon: the entry point, an edge with its midpoint dot, a port and a node.
function appIconSvg(scale = 1) {
  const grid = Array.from({ length: 15 }, (_, i) => (i + 1) * 32)
    .map((p) => `<path d="M${p} 0V512M0 ${p}H512" stroke="${color.grid}" stroke-width="2"/>`)
    .join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${color.canvas}"/>
  ${grid}
  <g transform="translate(256 256) scale(${scale}) translate(-256 -256)">
    <path d="M200 176H252Q276 176 276 200V312Q276 336 300 336H330" fill="none" stroke="${color.edge}" stroke-width="10"/>
    <circle cx="276" cy="256" r="11" fill="${color.fg}"/>
    <circle cx="144" cy="176" r="62" fill="${color.header}"/>
    <circle cx="144" cy="176" r="34" fill="${color.accent}"/>
    <rect x="346" y="290" width="120" height="104" rx="10" fill="${color.node}" stroke="${color.border}" stroke-width="3"/>
    <path d="M346 300Q346 290 356 290H456Q466 290 466 300V336H346Z" fill="${color.header}"/>
    <circle cx="370" cy="313" r="10" fill="none" stroke="${color.muted}" stroke-width="4"/>
    <circle cx="370" cy="313" r="5" fill="${color.accent}"/>
    <rect x="390" y="308" width="56" height="10" rx="5" fill="${color.muted}"/>
    <rect x="362" y="352" width="88" height="22" rx="5" fill="${color.canvas}"/>
    <circle cx="336" cy="336" r="14" fill="${color.accent}" stroke="${color.canvas}" stroke-width="6"/>
  </g>
</svg>
`
}

async function renderPng(page, svg, size) {
  await page.setViewportSize({ width: size, height: size })
  await page.setContent(
    `<style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`,
  )
  return page.screenshot({ omitBackground: true, type: "png" })
}

// An ICO file whose entries are PNG images, which every current browser reads.
function ico(images) {
  const header = Buffer.alloc(6 + images.length * 16)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(images.length, 4)
  let offset = header.length
  images.forEach(({ size, png }, index) => {
    const entry = 6 + index * 16
    header.writeUInt8(size >= 256 ? 0 : size, entry)
    header.writeUInt8(size >= 256 ? 0 : size, entry + 1)
    header.writeUInt16LE(1, entry + 4)
    header.writeUInt16LE(32, entry + 6)
    header.writeUInt32LE(png.length, entry + 8)
    header.writeUInt32LE(offset, entry + 12)
    offset += png.length
  })
  return Buffer.concat([header, ...images.map(({ png }) => png)])
}

async function icons(browser) {
  const page = await browser.newPage()
  const write = (name, data) => writeFileSync(new URL(name, PUBLIC), data)

  write("icon.svg", markSvg)
  const favicons = []
  for (const size of [16, 32, 48])
    favicons.push({ size, png: await renderPng(page, markSvg, size) })
  write("favicon.ico", ico(favicons))
  write("apple-touch-icon.png", await renderPng(page, appIconSvg(), 180))
  write("icon-192.png", await renderPng(page, appIconSvg(), 192))
  write("icon-512.png", await renderPng(page, appIconSvg(), 512))
  // Maskable icons keep their content inside the center 80% circle.
  write("icon-maskable-512.png", await renderPng(page, appIconSvg(0.78), 512))
  write(
    "site.webmanifest",
    JSON.stringify(
      {
        name: "GraphComp",
        short_name: "GraphComp",
        description: "Copy-paste components for node canvases, built on React Flow.",
        start_url: "/",
        display: "standalone",
        background_color: color.canvas,
        theme_color: color.canvas,
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      null,
      2,
    ) + "\n",
  )
  await page.close()
  console.log(
    "icons: icon.svg, favicon.ico, apple-touch-icon.png, icon-192/512, maskable, manifest",
  )
}

/** A screenshot of a page's live preview, as a data URL. */
async function capture(browser, path, { light = false, open = false } = {}) {
  // At this width the docs page puts the frame at 520 px, the width of the
  // OG image slot. The frame takes the slot height before React Flow fits
  // the view, so the preview is framed as it appears in the image.
  const page = await browser.newPage({
    viewport: { width: 552, height: 900 },
    deviceScaleFactor: 2,
    reducedMotion: "reduce",
  })
  await page.addInitScript(
    (theme) => {
      localStorage.setItem("gc-site-theme", theme)
      document.addEventListener("DOMContentLoaded", () => {
        const style = document.createElement("style")
        style.textContent = '[data-slot="canvas-frame"] { height: 486px !important; }'
        document.head.append(style)
      })
    },
    light ? "light" : "dark",
  )
  await page.goto(ORIGIN + path)
  const frame = page.locator('[data-slot="canvas-frame"]').first()
  await frame.locator(".react-flow__node").first().waitFor()
  if (open) await frame.getByRole("button", { name: "Expand" }).first().click()
  await page.waitForTimeout(900)
  const png = await frame.screenshot()
  await page.close()
  return `data:image/png;base64,${png.toString("base64")}`
}

function escape(text) {
  return text.replace(
    /[&<>"]/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char],
  )
}

function ogHtml({ eyebrow, title, description, image, font }) {
  return `<!doctype html>
<style>
  @font-face { font-family: Inter; src: url(${font}) format("woff2"); font-weight: 100 900; }
  * { box-sizing: border-box; }
  html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; }
  body {
    position: relative; background: ${color.canvas}; color: ${color.fg};
    font-family: Inter, sans-serif; -webkit-font-smoothing: antialiased;
  }
  .grid {
    position: absolute; inset: 0;
    background-image: linear-gradient(to right, ${color.grid} 1px, transparent 1px),
      linear-gradient(to bottom, ${color.grid} 1px, transparent 1px);
    background-size: 24px 24px;
    mask-image: radial-gradient(ellipse 80% 90% at 30% 40%, black 30%, transparent 100%);
  }
  .text { position: absolute; left: 72px; top: 64px; bottom: 64px; width: 520px; display: flex; flex-direction: column; }
  .brand { display: flex; align-items: center; gap: 14px; font-size: 26px; font-weight: 600; letter-spacing: -0.01em; }
  .brand svg { width: 34px; height: 34px; }
  .eyebrow { margin-top: auto; font-size: 22px; color: ${color.accent}; font-weight: 500; }
  h1 { margin: 10px 0 0; font-size: ${title.length > 20 ? 58 : 68}px; line-height: 1.05; font-weight: 650; letter-spacing: -0.03em; }
  p {
    margin: 22px 0 0; font-size: 25px; line-height: 1.4; color: #a8a8ad;
    display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
  }
  .url { margin-top: 30px; font-size: 20px; color: ${color.muted}; }
  .shot {
    position: absolute; left: 616px; top: 72px; width: 520px; height: 486px;
    border: 1px solid ${color.border}; border-radius: 16px; overflow: hidden;
    box-shadow: 0 24px 64px -16px rgb(0 0 0 / 0.7); background: ${color.canvas};
  }
  .shot img { width: 100%; height: 100%; display: block; }
</style>
<div class="grid"></div>
<div class="text">
  <div class="brand">${markSvg}GraphComp</div>
  ${eyebrow ? `<div class="eyebrow">${escape(eyebrow)}</div>` : ""}
  <h1${eyebrow ? "" : ' style="margin-top:auto"'}>${escape(title)}</h1>
  <p>${escape(description)}</p>
  <div class="url">graphcomp.reagent-systems.com</div>
</div>
<div class="shot"><img src="${image}"></div>
`
}

async function og(browser, server) {
  const { pages } = await server.ssrLoadModule("/site/content/pages.ts")
  const font = `data:font/woff2;base64,${readFileSync(
    require.resolve("@fontsource-variable/inter/files/inter-latin-wght-normal.woff2"),
  ).toString("base64")}`
  mkdirSync(new URL("og/", PUBLIC), { recursive: true })

  const flowDark = await capture(browser, "/docs/components/event-flow", { open: true })
  const flowLight = await capture(browser, "/docs/components/event-flow", {
    open: true,
    light: true,
  })
  const card = await browser.newPage({ viewport: { width: 1200, height: 630 } })

  for (const page of pages) {
    let image = flowDark
    if (page.path === "/docs/theming") image = flowLight
    else if (page.path.startsWith("/docs/components/") && !page.path.endsWith("/event-flow")) {
      image = await capture(browser, page.path)
    }
    const home = page.path === "/"
    await card.setContent(
      ogHtml({
        eyebrow: page.section,
        title: home ? "Components for node canvases" : page.title,
        description: home
          ? "Nodes, edges, ports and in-node widgets for React Flow. Copy the source into your app."
          : page.description,
        image,
        font,
      }),
    )
    await card.evaluate(() => document.fonts.ready)
    await card.screenshot({ path: new URL(`og/${page.og}`, PUBLIC).pathname, type: "png" })
    console.log(`og: ${page.og}`)
  }
  await card.close()
}

const only = process.argv.slice(2)
const server = await createServer({ server: { port: PORT, strictPort: true }, logLevel: "error" })
await server.listen()
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined })
try {
  mkdirSync(PUBLIC, { recursive: true })
  if (!only.length || only.includes("icons")) await icons(browser)
  if (!only.length || only.includes("og")) await og(browser, server)
} finally {
  await browser.close()
  await server.close()
}
