import { useEffect, useState } from "react"
import { ReactFlowProvider } from "@xyflow/react"
import { Moon, Sun } from "lucide-react"

import { EventFlow } from "@/registry/graphcomp/blocks/event-flow/event-flow"

export function App() {
  const [dark, setDark] = useState(true)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-gc-node-border/60 px-4 text-[13px]">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-gc-accent" />
          <span className="font-medium">GraphComp</span>
          <span className="text-gc-muted">Playground</span>
        </div>
        <button
          type="button"
          aria-label={dark ? "Use light theme" : "Use dark theme"}
          onClick={() => setDark(!dark)}
          className="grid size-8 place-items-center rounded-gc text-gc-muted hover:text-gc-fg [&_svg]:size-4"
        >
          {dark ? <Sun /> : <Moon />}
        </button>
      </header>
      <main className="relative min-h-0 flex-1">
        <ReactFlowProvider>
          <EventFlow />
        </ReactFlowProvider>
      </main>
    </div>
  )
}
