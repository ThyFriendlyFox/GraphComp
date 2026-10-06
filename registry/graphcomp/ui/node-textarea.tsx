import { useImperativeHandle, useLayoutEffect, useRef, type ComponentProps } from "react"
import { animate, useMotionValue, useMotionValueEvent, useReducedMotionConfig } from "motion/react"

import { cn } from "@/lib/utils"
import { useControllableState } from "@/registry/graphcomp/hooks/use-controllable-state"

/** The node spring (`nodeSpring` in node-card), so the node grows like an opening body. */
const growSpring = { type: "spring", bounce: 0, duration: 0.35 } as const

type NodeTextareaProps = Omit<
  ComponentProps<"textarea">,
  "value" | "defaultValue" | "onChange" | "rows"
> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Rows shown when the text is shorter. Default `2`. */
  minRows?: number
  /** Rows after which the field stops growing and scrolls. Default: no limit. */
  maxRows?: number
}

/**
 * A multi-line text field that grows with its text. The height follows the
 * node spring, so the node grows in the same frames. Typing, selecting text
 * and scrolling inside it never pan, zoom, move or delete the node.
 */
export function NodeTextarea({
  value: valueProp,
  defaultValue = "",
  onValueChange,
  minRows = 2,
  maxRows,
  ref,
  className,
  ...props
}: NodeTextareaProps) {
  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  })
  const elementRef = useRef<HTMLTextAreaElement>(null)
  const measured = useRef(false)
  const height = useMotionValue(0)
  const reduceMotion = useReducedMotionConfig()

  useImperativeHandle(ref, () => elementRef.current!, [])

  // The height is a motion value, not an `animate` target, so it renders on
  // Motion's frame loop, which motion tests and recordings step through.
  useMotionValueEvent(height, "change", (latest) => {
    const element = elementRef.current
    if (!element) return
    element.style.height = `${latest}px`
    // While the field grows, the browser scrolls the caret line into view.
    // Holding the text still lets the growing edge reveal it instead.
    if (element.style.overflowY === "hidden") element.scrollTop = 0
  })

  useLayoutEffect(() => {
    const element = elementRef.current
    if (!element) return
    const style = getComputedStyle(element)
    const line = parseFloat(style.lineHeight) || 0
    const padding = (parseFloat(style.paddingTop) || 0) + (parseFloat(style.paddingBottom) || 0)
    const current = element.style.height
    element.style.height = "0px"
    const content = element.scrollHeight
    element.style.height = current

    const max = maxRows ? maxRows * line + padding : Infinity
    const target = Math.min(max, Math.max(minRows * line + padding, content))
    element.style.overflowY = content > max ? "auto" : "hidden"

    if (!measured.current || reduceMotion) {
      measured.current = true
      height.jump(target)
      element.style.height = `${target}px`
    } else {
      animate(height, target, growSpring)
    }
  }, [value, minRows, maxRows, reduceMotion, height])

  return (
    <textarea
      ref={elementRef}
      data-slot="node-textarea"
      rows={minRows}
      value={value}
      onChange={(event) => setValue(event.target.value)}
      className={cn(
        "nodrag nowheel nokey block w-full min-w-0 resize-none rounded-gc bg-gc-inset px-2.5 py-2 text-[12px] leading-4 text-gc-fg",
        "placeholder:text-gc-muted disabled:opacity-50",
        "focus-visible:ring-2 focus-visible:ring-gc-ring focus-visible:outline-none",
        className,
      )}
      {...props}
    />
  )
}
