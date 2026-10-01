import { useEffect, useState } from "react"
import { Menu, Moon, Sun, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { REPO_URL } from "../lib/registry"
import { Link, usePath } from "../lib/router"

function GitHubIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  )
}

function useDark() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"))
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
    try {
      localStorage.setItem("gc-site-theme", dark ? "dark" : "light")
    } catch {
      // Storage can be blocked; the theme lasts for this page only.
    }
  }, [dark])
  return [dark, setDark] as const
}

const nav = [
  {
    to: "/docs",
    label: "Docs",
    match: (path: string) =>
      path === "/docs" || path.startsWith("/docs/installation") || path.startsWith("/docs/theming"),
  },
  {
    to: "/docs/components/node-card",
    label: "Components",
    match: (path: string) => path.startsWith("/docs/components"),
  },
  {
    to: "/docs/components/event-flow",
    label: "Blocks",
    match: (path: string) => path === "/docs/components/event-flow",
  },
]

const iconButton =
  "grid size-8 place-items-center rounded-gc text-gc-muted transition-colors hover:bg-gc-control/50 hover:text-gc-fg focus-visible:ring-2 focus-visible:ring-gc-ring focus-visible:outline-none [&_svg]:size-4"

export function SiteHeader({
  menuOpen,
  onMenuToggle,
}: {
  menuOpen?: boolean
  onMenuToggle?: () => void
}) {
  const path = usePath()
  const [dark, setDark] = useDark()

  return (
    <header className="sticky top-0 z-40 border-b border-gc-node-border/70 bg-gc-canvas/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
        {onMenuToggle ? (
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={onMenuToggle}
            className={cn(iconButton, "-ml-2 lg:hidden")}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        ) : null}
        <Link
          to="/"
          className="flex items-center gap-2 rounded-gc text-[14px] font-semibold focus-visible:ring-2 focus-visible:ring-gc-ring focus-visible:outline-none"
        >
          <span className="grid size-5 place-items-center rounded-full bg-gc-node-header">
            <span className="size-2.5 rounded-full bg-gc-accent" />
          </span>
          GraphComp
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-1 text-[13px] sm:flex">
          {nav.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              aria-current={item.match(path) ? "page" : undefined}
              className="rounded-gc px-2.5 py-1.5 text-gc-muted transition-colors hover:text-gc-fg focus-visible:ring-2 focus-visible:ring-gc-ring focus-visible:outline-none aria-[current=page]:text-gc-fg"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <a href={REPO_URL} aria-label="GitHub" className={iconButton}>
            <GitHubIcon />
          </a>
          <button
            type="button"
            aria-label={dark ? "Use light theme" : "Use dark theme"}
            onClick={() => setDark(!dark)}
            className={iconButton}
          >
            {dark ? <Sun /> : <Moon />}
          </button>
        </div>
      </div>
    </header>
  )
}
