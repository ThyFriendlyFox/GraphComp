import { useEffect } from "react"

import { componentDoc } from "./content/docs"
import { pageFor } from "./content/pages"
import { applyHead } from "./lib/head"
import { usePath } from "./lib/router"
import { ComponentPage } from "./pages/component-page"
import { DocsLayout } from "./pages/docs-layout"
import { InstallationPage, IntroductionPage, NotFoundPage, ThemingPage } from "./pages/docs-pages"
import { HomePage } from "./pages/home"

function DocsRoute({ path }: { path: string }) {
  if (path === "/docs") return <IntroductionPage />
  if (path === "/docs/installation") return <InstallationPage />
  if (path === "/docs/theming") return <ThemingPage />
  const doc = path.startsWith("/docs/components/")
    ? componentDoc(path.slice("/docs/components/".length))
    : undefined
  return doc ? <ComponentPage key={doc.name} doc={doc} /> : <NotFoundPage />
}

export function App() {
  const path = usePath()

  useEffect(() => {
    applyHead(pageFor(path))
  }, [path])

  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (hash) document.getElementById(hash)?.scrollIntoView()
  }, [path])

  if (path === "/") return <HomePage />
  return (
    <DocsLayout>
      <DocsRoute path={path} />
    </DocsLayout>
  )
}
