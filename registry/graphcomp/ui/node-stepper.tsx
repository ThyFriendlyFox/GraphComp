import { useState, type KeyboardEvent } from "react"
import { AnimatePresence, motion } from "motion/react"
import { ChevronDown, ChevronUp, Minus, Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import { useControllableState } from "@/registry/graphcomp/hooks/use-controllable-state"
import { NodePressable } from "@/registry/graphcomp/ui/node-pressable"

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

const rollSpring = { type: "spring", bounce: 0.2, duration: 0.3 } as const

/**
 * A number input that changes in steps, by buttons or arrow keys. The value
 * rolls up when it grows and down when it shrinks.
 */
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

  const [direction, setDirection] = useState<1 | -1>(1)

  function commit(next: number) {
    const clamped = Math.min(max, Math.max(min, roundToStep(next, step)))
    if (clamped === value) return
    setDirection(clamped > value ? 1 : -1)
    setValue(clamped)
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
    "grid h-full w-7 shrink-0 place-items-center rounded-gc text-gc-muted transition-colors hover:text-gc-fg disabled:opacity-30 disabled:hover:text-gc-muted [&_svg]:size-3"
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
        "relative flex h-6 flex-1 items-center overflow-hidden rounded-gc px-1 text-[12px] text-gc-fg tabular-nums",
        "focus-visible:ring-2 focus-visible:ring-gc-ring focus-visible:outline-none",
        variant === "inline" ? "justify-center" : "px-2.5",
      )}
    >
      <AnimatePresence initial={false} mode="popLayout" custom={direction}>
        <motion.span
          key={value}
          data-slot="node-stepper-value"
          custom={direction}
          variants={{
            enter: (d: number) => ({ y: d * 12, opacity: 0 }),
            center: { y: 0, opacity: 1 },
            exit: (d: number) => ({ y: d * -12, opacity: 0 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={rollSpring}
          className="truncate"
        >
          {format(value)}
        </motion.span>
      </AnimatePresence>
    </span>
  )

  return (
    <div
      data-slot="node-stepper"
      data-variant={variant}
      className={cn("nodrag nokey flex h-8 items-center rounded-gc bg-gc-inset", className)}
    >
      {variant === "inline" ? (
        <>
          <NodePressable
            tabIndex={-1}
            aria-label="Decrease"
            disabled={value <= min}
            onClick={() => commit(value - step)}
            className={button}
          >
            <Minus strokeWidth={2.5} />
          </NodePressable>
          {display}
          <NodePressable
            tabIndex={-1}
            aria-label="Increase"
            disabled={value >= max}
            onClick={() => commit(value + step)}
            className={button}
          >
            <Plus strokeWidth={2.5} />
          </NodePressable>
        </>
      ) : (
        <>
          {display}
          <div className="flex h-full flex-col justify-center pr-1">
            <NodePressable
              tabIndex={-1}
              aria-label="Increase"
              disabled={value >= max}
              onClick={() => commit(value + step)}
              className={cn(button, "h-3")}
            >
              <ChevronUp strokeWidth={2.5} />
            </NodePressable>
            <NodePressable
              tabIndex={-1}
              aria-label="Decrease"
              disabled={value <= min}
              onClick={() => commit(value - step)}
              className={cn(button, "h-3")}
            >
              <ChevronDown strokeWidth={2.5} />
            </NodePressable>
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
