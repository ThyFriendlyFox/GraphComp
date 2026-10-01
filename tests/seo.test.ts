import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import manifest from "../registry.json"
import { seo } from "../scripts/seo"
import { componentDocs } from "../site/content/docs"
import { componentNames, headTags, notFoundPage, pages } from "../site/content/pages"

const SITE = "https://graphcomp.reagent-systems.com"
const publicFile = (name: string) => join(__dirname, "../public", name)

function pngSize(file: string) {
  const data = readFileSync(file)
  return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) }
}

describe("pages", () => {
  it("lists every installable registry item that has a docs page", () => {
    const items = manifest.items
      .filter((item) => item.type !== "registry:file" && item.type !== "registry:hook")
      .map((item) => item.name)
    expect([...componentNames].sort()).toEqual([...items].sort())
    expect(componentDocs.map((doc) => doc.name)).toEqual(componentNames)
  })

  it("gives every page a unique title, a description and an OG image of 1200×630", () => {
    expect(new Set(pages.map((page) => page.title)).size).toBe(pages.length)
    for (const page of pages) {
      expect(page.description.length, page.path).toBeGreaterThan(50)
      expect(page.description.length, page.path).toBeLessThanOrEqual(170)
      const file = publicFile(`og/${page.og}`)
      expect(existsSync(file), `missing public/og/${page.og}; run pnpm assets`).toBe(true)
      expect(pngSize(file)).toEqual({ width: 1200, height: 630 })
    }
  })

  it("writes absolute canonical, Open Graph and Twitter tags", () => {
    const tags = headTags(
      pages.find((page) => page.path === "/docs/components/node-card")!,
      SITE,
    )
    expect(tags).toContain(`<link rel="canonical" href="${SITE}/docs/components/node-card" />`)
    expect(tags).toContain(`<meta property="og:image" content="${SITE}/og/node-card.png" />`)
    expect(tags).toContain(`<meta name="twitter:card" content="summary_large_image" />`)
    expect(tags).toContain('"@type":"BreadcrumbList"')
  })

  it("keeps the not found page out of the index", () => {
    const tags = headTags(notFoundPage, SITE)
    expect(tags).toContain('<meta name="robots" content="noindex" />')
    expect(tags).not.toContain("canonical")
  })
})

describe("icons", () => {
  it("ships every icon that index.html and the manifest name", () => {
    const html = readFileSync(join(__dirname, "../index.html"), "utf8")
    const linked = [
      ...html.matchAll(/<link rel="(?:icon|apple-touch-icon|manifest)" href="\/([^"]+)"/g),
    ]
    expect(linked.length).toBe(4)
    for (const [, name] of linked) expect(existsSync(publicFile(name)), name).toBe(true)

    const webmanifest = JSON.parse(readFileSync(publicFile("site.webmanifest"), "utf8"))
    for (const icon of webmanifest.icons) {
      const [width, height] = icon.sizes.split("x").map(Number)
      expect(pngSize(publicFile(icon.src.slice(1)))).toEqual({ width, height })
    }
    expect(pngSize(publicFile("apple-touch-icon.png"))).toEqual({ width: 180, height: 180 })
  })
})

describe("seo build plugin", () => {
  it("writes one HTML file per route, 404.html, sitemap.xml and robots.txt", () => {
    const dir = mkdtempSync(join(tmpdir(), "gc-seo-"))
    const plugin = seo()
    const transform = plugin.transformIndexHtml as {
      handler: (html: string, ctx: object) => string
    }
    const template = readFileSync(join(__dirname, "../index.html"), "utf8")
    writeFileSync(join(dir, "index.html"), transform.handler(template, {}))
    ;(plugin.writeBundle as (options: { dir: string }) => void)({ dir })

    for (const page of pages.filter((entry) => entry.path !== "/")) {
      const html = readFileSync(join(dir, page.path, "index.html"), "utf8")
      expect(html).toContain(`<link rel="canonical" href="${SITE}${page.path}" />`)
      expect(html).toContain(`<h1>${page.title}</h1>`)
      expect(html.match(/<title>/g)).toHaveLength(1)
    }
    expect(readFileSync(join(dir, "404.html"), "utf8")).toContain('content="noindex"')

    const sitemap = readFileSync(join(dir, "sitemap.xml"), "utf8")
    expect(sitemap.match(/<loc>/g)).toHaveLength(pages.length)
    expect(readFileSync(join(dir, "robots.txt"), "utf8")).toContain(`Sitemap: ${SITE}/sitemap.xml`)
  })
})
