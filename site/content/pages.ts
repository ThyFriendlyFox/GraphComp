// Every route of the docs site with its head data. The SEO build plugin
// (`scripts/seo.ts`) reads this file in Node, so it imports only JSON.
import manifest from "../../registry.json"

export const SITE_NAME = "GraphComp"
export const SITE_DESCRIPTION =
  "Copy-paste components for node-based canvas interfaces. Nodes, edges, ports and in-node widgets for React Flow, styled with Tailwind CSS and animated with Motion."
export const REPO_URL = "https://github.com/ThyFriendlyFox/GraphComp"

export type Page = {
  path: string
  /** The page name. The document title adds " – GraphComp" to it, except on the home page. */
  title: string
  description: string
  /** File name in `public/og/`, written by `pnpm assets`. */
  og: string
  /** Breadcrumb section; the home page has none. */
  section?: string
}

/** Registry items with a docs page, in sidebar order. */
export const componentNames = [
  "flow-canvas",
  "flow-edge",
  "node-port",
  "node-card",
  "node-pressable",
  "node-segmented",
  "node-select",
  "node-stepper",
  "node-input",
  "node-textarea",
  "event-flow",
]

function item(name: string) {
  const found = manifest.items.find((entry) => entry.name === name)
  if (!found) throw new Error(`Unknown registry item: ${name}`)
  return found
}

export const pages: Page[] = [
  {
    path: "/",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    og: "home.png",
  },
  {
    path: "/docs",
    title: "Introduction",
    description:
      "Nodes, edges, ports and in-node widgets for React Flow. You copy the source into your project and change it.",
    og: "docs.png",
    section: "Docs",
  },
  {
    path: "/docs/installation",
    title: "Installation",
    description:
      "Add GraphComp to a React project with Tailwind CSS 4 and the shadcn CLI: add the theme, import it, add a component.",
    og: "docs-installation.png",
    section: "Docs",
  },
  {
    path: "/docs/theming",
    title: "Theming",
    description:
      "Every GraphComp color is a --gc-* CSS variable, in light and dark. Re-theme the canvas, a group of nodes or one node.",
    og: "docs-theming.png",
    section: "Docs",
  },
  ...componentNames.map((name) => ({
    path: `/docs/components/${name}`,
    title: item(name).title,
    description: `${item(name).description} A GraphComp ${item(name).type === "registry:block" ? "block" : "component"} for React Flow.`,
    og: `${name}.png`,
    section: item(name).type === "registry:block" ? "Blocks" : "Components",
  })),
]

export const notFoundPage: Page = {
  path: "/404",
  title: "Page not found",
  description: "No page has this address.",
  og: "home.png",
}

export function pageFor(path: string) {
  return pages.find((page) => page.path === path) ?? notFoundPage
}

export function documentTitle(page: Page) {
  return page.path === "/"
    ? `${SITE_NAME}: components for node canvases`
    : `${page.title} – ${SITE_NAME}`
}

const escapes: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
}

function escape(text: string) {
  return text.replace(/[&<>"]/g, (char) => escapes[char])
}

function structuredData(page: Page, siteUrl: string) {
  const url = siteUrl + page.path
  if (page.path === "/") {
    return [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE_NAME,
        url,
        description: SITE_DESCRIPTION,
      },
      {
        "@context": "https://schema.org",
        "@type": "SoftwareSourceCode",
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        url,
        codeRepository: REPO_URL,
        programmingLanguage: ["TypeScript", "React"],
        license: "https://opensource.org/licenses/MIT",
      },
    ]
  }
  const crumbs = [
    { name: SITE_NAME, url: siteUrl + "/" },
    { name: page.section ?? "Docs", url: siteUrl + "/docs" },
    { name: page.title, url },
  ]
  return [
    {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      headline: page.title,
      description: page.description,
      url,
      image: `${siteUrl}/og/${page.og}`,
      isPartOf: { "@type": "WebSite", name: SITE_NAME, url: siteUrl + "/" },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.name,
        item: crumb.url,
      })),
    },
  ]
}

/** The per-page tags in `<head>`: title, description, canonical, Open Graph, Twitter and JSON-LD. */
export function headTags(page: Page, siteUrl: string) {
  const url = siteUrl + (page.path === "/" ? "/" : page.path)
  const image = `${siteUrl}/og/${page.og}`
  const title = documentTitle(page)
  const indexable = page !== notFoundPage
  const json = JSON.stringify(structuredData(page, siteUrl)).replace(/</g, "\\u003c")
  return [
    `<title>${escape(title)}</title>`,
    `<meta name="description" content="${escape(page.description)}" />`,
    indexable
      ? `<link rel="canonical" href="${url}" />`
      : `<meta name="robots" content="noindex" />`,
    `<meta property="og:type" content="${page.path === "/" ? "website" : "article"}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:title" content="${escape(title)}" />`,
    `<meta property="og:description" content="${escape(page.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${escape(`${page.title}: ${SITE_NAME}`)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escape(title)}" />`,
    `<meta name="twitter:description" content="${escape(page.description)}" />`,
    `<meta name="twitter:image" content="${image}" />`,
    indexable ? `<script type="application/ld+json">${json}</script>` : "",
  ]
    .filter(Boolean)
    .join("\n    ")
}

/**
 * Plain HTML for `#root` before the app mounts, for crawlers that do not run
 * scripts. `footer` is HTML placed after the page links.
 */
export function fallbackBody(page: Page, footer = "") {
  const links = pages
    .map((entry) => `<li><a href="${entry.path}">${escape(entry.title)}</a></li>`)
    .join("")
  return `<div class="seo-fallback"><h1>${escape(page.path === "/" ? "Components for node canvases" : page.title)}</h1><p>${escape(page.description)}</p><nav><ul>${links}</ul></nav>${footer}</div>`
}
