import type { KeyboardEvent } from "react"
import { ChevronDown, ChevronUp, Minus, Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import { useControllableState } from "@/registry/graphcomp/hooks/use-controllable-state"

type NodeStepperProps = {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
  /** Turns the number into display text, such as `53%` or `2 sec`. */
  format?: (value: number) => string
  /** `inline`: minus, value, plus. `spin`: value with up and down arrows at the end. */
  variant?: "inline" | "spin"
  className?: string
  "aria-label"?: string
}

/** A number input that changes in steps, by buttons or arrow keys. */
export function NodeStepper({
  value: valueProp,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  format = String,
  variant = "inline",
  className,
  "aria-label": ariaLabel,
}: NodeStepperProps) {
  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue: defaultValue ?? min,
    onChange: onValueChange,
  })

  function commit(next: number) {
    const clamped = Math.min(max, Math.max(min, roundToStep(next, step)))
    if (clamped !== value) setValue(clamped)
  }

  function onKeyDown(event: KeyboardEvent) {
    const actions: Record<string, () => void> = {
      ArrowUp: () => commit(value + step),
      ArrowRight: () => commit(value + step),
      ArrowDown: () => commit(value - step),
      ArrowLeft: () => commit(value - step),
      PageUp: () => commit(value + step * 10),
      PageDown: () => commit(value - step * 10),
      Home: () => commit(min),
      End: () => commit(max),
    }
    const action = actions[event.key]
    if (!action) return
    event.preventDefault()
    action()
  }

  const button =
    "grid w-7 shrink-0 place-items-center text-gc-muted transition-colors hover:text-gc-fg disabled:opacity-30 disabled:hover:text-gc-muted [&_svg]:size-3"
  const display = (
    <span
      role="spinbutton"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuetext={format(value)}
      onKeyDown={onKeyDown}
      className={cn(
        "flex-1 truncate rounded-gc px-1 text-[12px] text-gc-fg tabular-nums",
        "focus-visible:ring-2 focus-visible:ring-gc-ring focus-visible:outline-none",
        variant === "inline" ? "text-center" : "px-2.5",
      )}
    >
      {format(value)}
    </span>
  )

  return (
    <div
      data-slot="node-stepper"
      data-variant={variant}
      className={cn("nodrag flex h-8 items-center rounded-gc bg-gc-inset", className)}
    >
      {variant === "inline" ? (
        <>
          <button
            type="button"
            tabIndex={-1}
            aria-label="Decrease"
            disabled={value <= min}
            onClick={() => commit(value - step)}
            className={button}
          >
            <Minus strokeWidth={2.5} />
          </button>
          {display}
          <button
            type="button"
            tabIndex={-1}
            aria-label="Increase"
            disabled={value >= max}
            onClick={() => commit(value + step)}
            className={button}
          >
            <Plus strokeWidth={2.5} />
          </button>
        </>
      ) : (
        <>
          {display}
          <div className="flex h-full flex-col justify-center pr-1">
            <button
              type="button"
              tabIndex={-1}
              aria-label="Increase"
              disabled={value >= max}
              onClick={() => commit(value + step)}
              className={cn(button, "h-3")}
            >
              <ChevronUp strokeWidth={2.5} />
            </button>
            <button
              type="button"
              tabIndex={-1}
              aria-label="Decrease"
              disabled={value <= min}
              onClick={() => commit(value - step)}
              className={cn(button, "h-3")}
            >
              <ChevronDown strokeWidth={2.5} />
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function roundToStep(value: number, step: number) {
  const decimals = (String(step).split(".")[1] ?? "").length
  return Number((Math.round(value / step) * step).toFixed(decimals))
}
