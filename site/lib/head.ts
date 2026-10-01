import { headTags, type Page } from "../content/pages"

const SITE_URL: string = import.meta.env.VITE_SITE_URL ?? window.location.origin

function markers() {
  const comments = [...document.head.childNodes].filter(
    (node) => node.nodeType === Node.COMMENT_NODE,
  )
  const start = comments.find((node) => node.nodeValue === "seo:start")
  const end = comments.find((node) => node.nodeValue === "seo:end")
  return start && end ? { start, end } : undefined
}

/** Replaces the page head tags that the build wrote, so they follow client-side navigation. */
export function applyHead(page: Page) {
  const range = markers()
  if (!range) return
  while (range.start.nextSibling && range.start.nextSibling !== range.end) {
    range.start.nextSibling.remove()
  }
  const template = document.createElement("template")
  template.innerHTML = headTags(page, SITE_URL)
  // Scripts parsed into a template never run, so JSON-LD stays inert data.
  document.head.insertBefore(template.content, range.end)
}
