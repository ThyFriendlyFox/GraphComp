import type { HighlighterCore } from "shiki/core"

export type Lang = "tsx" | "css" | "bash" | "json"

let highlighter: Promise<HighlighterCore> | undefined

// Loaded on first use, with only the grammars and themes the site needs.
function load() {
  highlighter ??= Promise.all([import("shiki/core"), import("shiki/engine/javascript")]).then(
    ([{ createHighlighterCore }, { createJavaScriptRegexEngine }]) =>
      createHighlighterCore({
        themes: [
          import("shiki/themes/github-light-default.mjs"),
          import("shiki/themes/github-dark-default.mjs"),
        ],
        langs: [
          import("shiki/langs/tsx.mjs"),
          import("shiki/langs/css.mjs"),
          import("shiki/langs/bash.mjs"),
          import("shiki/langs/json.mjs"),
        ],
        engine: createJavaScriptRegexEngine(),
      }),
  )
  return highlighter
}

/** Highlighted HTML with light colors inline and dark colors in `--shiki-dark`. */
export async function highlight(code: string, lang: Lang) {
  const shiki = await load()
  return shiki.codeToHtml(code, {
    lang,
    themes: { light: "github-light-default", dark: "github-dark-default" },
    defaultColor: "light",
  })
}
