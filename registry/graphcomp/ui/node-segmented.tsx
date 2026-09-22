import { useId, useRef, type KeyboardEvent, type ReactNode } from "react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"
import { useControllableState } from "@/registry/graphcomp/hooks/use-controllable-state"

export type NodeSegmentedOption<T extends string> = {
  value: T
  label: ReactNode
  disabled?: boolean
}

type NodeSegmentedProps<T extends string> = {
  options: NodeSegmentedOption<T>[]
  value?: T
  defaultValue?: T
  onValueChange?: (value: T) => void
  className?: string
  "aria-label"?: string
}

/** A row of mutually exclusive options. The selected pill slides between them. */
export function NodeSegmented<T extends string>({
  options,
  value: valueProp,
  defaultValue,
  onValueChange,
  className,
  "aria-label": ariaLabel,
}: NodeSegmentedProps<T>) {
  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue: defaultValue ?? options[0]?.value,
    onChange: onValueChange,
  })
  const pillId = useId()
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const enabled = options.filter((option) => !option.disabled)

  function onKeyDown(event: KeyboardEvent) {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key]
    if (step === undefined) return
    event.preventDefault()
    const index = enabled.findIndex((option) => option.value === value)
    const next = enabled[(index + step + enabled.length) % enabled.length]
    setValue(next.value)
    refs.current[options.indexOf(next)]?.focus()
  }

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      data-slot="node-segmented"
      onKeyDown={onKeyDown}
      className={cn("nodrag flex h-8 rounded-gc bg-gc-inset p-0.5", className)}
    >
      {options.map((option, index) => {
        const checked = option.value === value
        return (
          <button
            key={option.value}
            ref={(element) => {
              refs.current[index] = element
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            disabled={option.disabled}
            tabIndex={checked ? 0 : -1}
            onClick={() => setValue(option.value)}
            className={cn(
              "relative flex-1 rounded-[calc(var(--gc-radius)-1px)] px-3 text-[12px] transition-colors",
              "focus-visible:ring-2 focus-visible:ring-gc-ring focus-visible:outline-none disabled:opacity-40",
              checked ? "text-gc-accent-fg" : "text-gc-muted hover:text-gc-fg",
            )}
          >
            {checked ? (
              <motion.span
                layoutId={pillId}
                className="absolute inset-0 rounded-[inherit] bg-gc-accent"
                transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
              />
            ) : null}
            <span className="relative">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
