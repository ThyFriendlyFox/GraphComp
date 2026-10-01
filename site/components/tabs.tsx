import { useId, useRef, type KeyboardEvent, type ReactNode } from "react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

export type Tab<T extends string> = { value: T; label: ReactNode }

/** A WAI-ARIA tab list with an underline that slides to the selected tab. */
export function Tabs<T extends string>({
  tabs,
  value,
  onValueChange,
  label,
  className,
  children,
}: {
  tabs: Tab<T>[]
  value: T
  onValueChange: (value: T) => void
  label: string
  className?: string
  children?: ReactNode
}) {
  const id = useId()
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  function onKeyDown(event: KeyboardEvent) {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key]
    if (step === undefined) return
    event.preventDefault()
    const index = tabs.findIndex((tab) => tab.value === value)
    const next = (index + step + tabs.length) % tabs.length
    onValueChange(tabs[next].value)
    refs.current[next]?.focus()
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div role="tablist" aria-label={label} onKeyDown={onKeyDown} className="flex gap-1">
        {tabs.map((tab, index) => {
          const selected = tab.value === value
          return (
            <button
              key={tab.value}
              ref={(element) => {
                refs.current[index] = element
              }}
              type="button"
              role="tab"
              id={`${id}-${tab.value}`}
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => onValueChange(tab.value)}
              className={cn(
                "relative h-9 px-2.5 text-[13px] text-gc-muted transition-colors hover:text-gc-fg",
                "rounded-gc focus-visible:ring-2 focus-visible:ring-gc-ring focus-visible:outline-none",
                selected && "text-gc-fg",
              )}
            >
              {tab.label}
              {selected ? (
                <motion.span
                  layoutId={`${id}-underline`}
                  className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-gc-fg"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
                />
              ) : null}
            </button>
          )
        })}
      </div>
      {children}
    </div>
  )
}
