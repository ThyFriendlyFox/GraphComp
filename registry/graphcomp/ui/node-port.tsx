import { useLayoutEffect, useRef, type CSSProperties } from "react"
import { Handle, Position, useNodeId, useStoreApi, type HandleProps } from "@xyflow/react"

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
  id,
  position,
  offset = 14,
  align = "center",
  className,
  style,
  ...props
}: NodePortProps) {
  const nodeId = useNodeId()
  const store = useStoreApi()
  const portRef = useRef<HTMLDivElement>(null)

  // Re-measures the node when a port mounts, unmounts or moves, so React Flow
  // finds its handle. This skips `useUpdateNodeInternals`: it looks the node
  // up by an unescaped `data-id` selector, which throws on an id with a quote.
  useLayoutEffect(() => {
    // Captured now: React detaches the ref before this effect's cleanup runs.
    const nodeElement = portRef.current?.closest<HTMLDivElement>(".react-flow__node")
    if (!nodeId || !nodeElement) return

    const refresh = () => {
      requestAnimationFrame(() => {
        const { nodeLookup, updateNodeInternals } = store.getState()
        // Until React Flow measures the node, its own measurement includes this
        // port. Measuring one node earlier resolves the initial fitView early.
        if (!nodeElement.isConnected || !nodeLookup.get(nodeId)?.internals.handleBounds) return
        updateNodeInternals(new Map([[nodeId, { id: nodeId, nodeElement, force: true }]]))
      })
    }

    refresh()
    return refresh
  }, [align, id, nodeId, position, store])

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
      ref={portRef}
      position={position}
      id={id}
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
