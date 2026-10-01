import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"
import { CopyButton } from "./copy-button"
import { Tabs } from "./tabs"

type Manager = "pnpm" | "npm" | "yarn" | "bun"

const managers: Manager[] = ["pnpm", "npm", "yarn", "bun"]
const STORAGE_KEY = "gc-site-package-manager"
const listeners = new Set<(manager: Manager) => void>()

function stored(): Manager {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    if (managers.includes(value as Manager)) return value as Manager
  } catch {
    // Storage can be blocked; the default applies.
  }
  return "pnpm"
}

/** Every command block on the page shares one package manager choice. */
function useManager() {
  const [manager, setManager] = useState<Manager>(stored)
  useEffect(() => {
    listeners.add(setManager)
    return () => {
      listeners.delete(setManager)
    }
  }, [])
  function choose(next: Manager) {
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Storage can be blocked; the choice lasts for this page only.
    }
    listeners.forEach((listener) => listener(next))
  }
  return [manager, choose] as const
}

const runners: Record<Manager, string> = {
  pnpm: "pnpm dlx",
  npm: "npx",
  yarn: "yarn dlx",
  bun: "bunx --bun",
}
const adders: Record<Manager, string> = {
  pnpm: "pnpm add",
  npm: "npm install",
  yarn: "yarn add",
  bun: "bun add",
}

/**
 * A shell command shown for each package manager. `run` is a package binary
 * with arguments (`shadcn@latest add …`); `add` is a list of npm packages.
 */
export function Command({
  run,
  add,
  className,
}: {
  run?: string
  add?: string[]
  className?: string
}) {
  const [manager, setManager] = useManager()
  const command = run ? `${runners[manager]} ${run}` : `${adders[manager]} ${add?.join(" ")}`

  return (
    <div
      data-slot="command"
      className={cn(
        "overflow-hidden rounded-lg border border-gc-node-border bg-gc-inset text-[13px]",
        className,
      )}
    >
      <Tabs
        label="Package manager"
        tabs={managers.map((value) => ({ value, label: value }))}
        value={manager}
        onValueChange={setManager}
        className="border-b border-gc-node-border pr-2 pl-2"
      >
        <CopyButton value={command} label="Copy command" className="ml-auto" />
      </Tabs>
      <pre className="overflow-x-auto px-4 py-3.5 font-mono text-[13px] text-gc-fg">
        <code>{command}</code>
      </pre>
    </div>
  )
}
