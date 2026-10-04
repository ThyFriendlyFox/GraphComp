import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import type { Plugin } from "vite"

import { UsefulShelfBadge } from "../site/components/useful-shelf-badge"
import { fallbackBody, headTags, notFoundPage, pageFor, pages } from "../site/content/pages"

/**
 * The absolute site URL for canonical links, Open Graph images and the
 * sitemap. Preview deploys use it too, so their canonical links point at
 * production.
 */
export function siteUrl() {
  return (process.env.SITE_URL ?? "https://graphcomp.reagent-systems.com").replace(/\/$/, "")
}

const HEAD = "<!--seo-head-->"
const ROOT = '<div id="root"></div>'

// UsefulShelf checks the server-rendered HTML for its badge, so every page
// carries it before scripts run. React's footer shows the same component.
// React adds an image preload hint, which only matters inside a React tree.
const badge = `<footer>${renderToStaticMarkup(createElement(UsefulShelfBadge)).replace(
  /<link rel="preload"[^>]*>/,
  "",
)}</footer>`

function render(html: string, path: string, url: string) {
  const page = path === notFoundPage.path ? notFoundPage : pageFor(path)
  return html
    .replace(HEAD, `<!--seo:start-->\n    ${headTags(page, url)}\n    <!--seo:end-->`)
    .replace(
      ROOT,
      `<div id="root"><!--fallback:start-->${fallbackBody(page, badge)}<!--fallback:end--></div>`,
    )
}

/**
 * Writes the per-page head tags into the site HTML. In dev it renders the
 * requested route. In a build it writes one HTML file per route, `404.html`,
 * `sitemap.xml` and `robots.txt`, so crawlers and link previews get the
 * right tags without running scripts.
 */
export function seo(): Plugin {
  const url = siteUrl()
  let template = ""

  return {
    name: "graphcomp-seo",
    config: () => ({ define: { "import.meta.env.VITE_SITE_URL": JSON.stringify(url) } }),
    transformIndexHtml: {
      order: "pre",
      handler(html, ctx) {
        if (!html.includes(HEAD)) return html
        if (ctx.server) {
          const path = (ctx.originalUrl ?? "/").split(/[?#]/)[0].replace(/(.)\/$/, "$1")
          return render(html, path, url)
        }
        template = html
        return render(html, "/", url)
      },
    },
    writeBundle(options) {
      if (!template) return
      const dir = options.dir ?? "dist"
      // The built template carries the hashed script and style tags.
      const built = readFileSync(join(dir, "index.html"), "utf8")
      const shell = built
        .replace(/<!--seo:start-->[\s\S]*?<!--seo:end-->/, HEAD)
        .replace(/<div id="root"><!--fallback:start-->[\s\S]*?<!--fallback:end--><\/div>/, ROOT)

      for (const page of pages) {
        if (page.path === "/") continue
        const file = join(dir, page.path, "index.html")
        mkdirSync(dirname(file), { recursive: true })
        writeFileSync(file, render(shell, page.path, url))
      }
      writeFileSync(join(dir, "404.html"), render(shell, notFoundPage.path, url))

      const today = new Date().toISOString().slice(0, 10)
      const entries = pages
        .map(
          (page) =>
            `  <url><loc>${url}${page.path === "/" ? "/" : page.path}</loc><lastmod>${today}</lastmod></url>`,
        )
        .join("\n")
      writeFileSync(
        join(dir, "sitemap.xml"),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`,
      )
      writeFileSync(
        join(dir, "robots.txt"),
        `User-agent: *\nAllow: /\nDisallow: /playground/\n\nSitemap: ${url}/sitemap.xml\n`,
      )
    },
  }
}
