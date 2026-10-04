import { useState, type ReactNode } from "react"
import { AnimatePresence, motion } from "motion/react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { DocsSidebar, sections } from "../components/docs-sidebar"
import { SiteFooter } from "../components/site-footer"
import { SiteHeader } from "../components/site-header"
import { Link, usePath } from "../lib/router"

export function DocsLayout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader menuOpen={menuOpen} onMenuToggle={() => setMenuOpen(!menuOpen)} />
      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            key="menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: "spring", bounce: 0, duration: 0.25 }}
            className="fixed inset-x-0 top-14 bottom-0 z-30 overflow-y-auto bg-gc-canvas px-4 py-6 lg:hidden"
          >
            <DocsSidebar onNavigate={() => setMenuOpen(false)} />
          </motion.div>
        ) : null}
      </AnimatePresence>
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-10 px-4 sm:px-6">
        <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-56 shrink-0 overflow-y-auto py-8 pr-2 lg:block">
          <DocsSidebar />
        </aside>
        <main className="min-w-0 flex-1 py-8 lg:py-10">
          <div className="mx-auto max-w-3xl">{children}</div>
        </main>
      </div>
      <SiteFooter />
    </div>
  )
}

/** Links to the previous and next pages in sidebar order. */
export function DocsPager() {
  const path = usePath()
  const links = sections.flatMap((section) => section.links)
  const index = links.findIndex((link) => link.to === path)
  const previous = links[index - 1]
  const next = links[index + 1]
  const style =
    "flex items-center gap-1.5 rounded-gc border border-gc-node-border px-3 py-2 text-[13px] transition-colors hover:bg-gc-control/40 focus-visible:ring-2 focus-visible:ring-gc-ring focus-visible:outline-none [&_svg]:size-4"

  return (
    <div className="mt-16 flex items-center justify-between gap-4">
      {previous ? (
        <Link to={previous.to} className={style}>
          <ChevronLeft />
          {previous.label}
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link to={next.to} className={style}>
          {next.label}
          <ChevronRight />
        </Link>
      ) : null}
    </div>
  )
}
