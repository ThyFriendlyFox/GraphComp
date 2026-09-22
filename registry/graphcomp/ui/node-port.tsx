import type { CSSProperties } from "react"
import { Handle, Position, type HandleProps } from "@xyflow/react"

import { cn } from "@/lib/utils"

type NodePortProps = HandleProps & {
  className?: string
  style?: CSSProperties
  /** Distance in pixels between the node edge and the port dot. */
  offset?: number
  /** `header` pins the port to the header row, so it stays put while the body opens. */
  align?: "center" | "header"
}

const HEADER_CENTER = 22

export function NodePort({
  position,
  offset = 14,
  align = "center",
  className,
  style,
  ...props
}: NodePortProps) {
  const placement: CSSProperties = {}
  if (position === Position.Left) placement.left = -offset
  if (position === Position.Right) placement.right = -offset
  if (position === Position.Top) placement.top = -offset
  if (position === Position.Bottom) placement.bottom = -offset
  if (align === "header" && (position === Position.Left || position === Position.Right)) {
    placement.top = HEADER_CENTER
  }

  return (
    <Handle
      position={position}
      data-slot="node-port"
      className={cn("group/port p-1.5", className)}
      style={{ ...placement, ...style }}
      {...props}
    >
      <span
        className={cn(
          "pointer-events-none block size-2.5 rounded-full bg-gc-accent ring-3 ring-gc-canvas",
          "transition-transform duration-150 group-hover/port:scale-125",
          "group-[.connectingfrom]/port:scale-125 group-[.valid]/port:scale-150",
        )}
      />
    </Handle>
  )
}
