import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"
import { useControllableState } from "@/registry/graphcomp/hooks/use-controllable-state"

type NodeInputProps = Omit<ComponentProps<"input">, "value" | "defaultValue" | "onChange"> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

/**
 * A single-line text field. Typing, selecting text and scrolling inside it
 * never pan, zoom, move or delete the node.
 */
export function NodeInput({
  value: valueProp,
  defaultValue = "",
  onValueChange,
  type = "text",
  className,
  ...props
}: NodeInputProps) {
  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  })

  return (
    <input
      data-slot="node-input"
      type={type}
      value={value}
      onChange={(event) => setValue(event.target.value)}
      className={cn(
        "nodrag nowheel nokey h-8 w-full min-w-0 rounded-gc bg-gc-inset px-2.5 text-[12px] text-gc-fg",
        "placeholder:text-gc-muted disabled:opacity-50",
        "focus-visible:ring-2 focus-visible:ring-gc-ring focus-visible:outline-none",
        className,
      )}
      {...props}
    />
  )
}
