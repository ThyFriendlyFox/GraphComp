import type { ComponentProps, CSSProperties, ReactNode } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Position, type HandleType } from "@xyflow/react"

import { cn } from "@/lib/utils"
import { nodeBodyMotion, useNodeCard } from "@/registry/graphcomp/ui/node-card"
import { NodePort } from "@/registry/graphcomp/ui/node-port"

export type NodePortListItem = {
  /** The handle id. Unique among all ports of the flow node. */
  id: string
  label: ReactNode
  /** Content at the far end of the row, away from the port. */
  trailing?: ReactNode
}

type Side = Position.Left | Position.Right

type NodePortListProps = Omit<ComponentProps<"div">, "children"> & {
  ports: NodePortListItem[]
  type: HandleType
  /** The node edge the ports sit on. */
  position?: Side
  /** Distance in pixels between the node edge and the port dot. */
  offset?: number
}

// The row is not `relative`, so the port positions against NodeCard: its
// x is the card edge whatever the body padding. With no `top`, the port
// keeps its static position, which the row's `items-center` centers.
function rowPortStyle(position: Side): CSSProperties {
  return {
    top: "auto",
    bottom: "auto",
    transform: position === Position.Right ? "translateX(50%)" : "translateX(-50%)",
  }
}

function NodePortRow({
  port,
  type,
  position,
  offset,
}: {
  port: NodePortListItem
  type: HandleType
  position: Side
  offset?: number
}) {
  // A row that is animating out has already handed its port to the header.
  const { open } = useNodeCard()
  const right = position === Position.Right
  return (
    <div
      role="listitem"
      data-slot="node-port-row"
      className={cn("flex h-8 min-w-0 items-center gap-2", right && "flex-row-reverse")}
    >
      {open ? (
        <NodePort
          id={port.id}
          type={type}
          position={position}
          offset={offset}
          style={rowPortStyle(position)}
        />
      ) : null}
      <span data-slot="node-port-label" className="truncate text-gc-fg/90">
        {port.label}
      </span>
      {port.trailing ? (
        <span
          data-slot="node-port-trailing"
          className={cn("shrink-0 text-gc-muted tabular-nums", right ? "mr-auto" : "ml-auto")}
        >
          {port.trailing}
        </span>
      ) : null}
    </div>
  )
}

/**
 * Labeled rows, each with a port on the node edge. Render it in NodeCard,
 * directly after NodeBody, not inside it. While the node is closed, the ports sit at
 * the header, so their edges stay connected.
 */
export function NodePortList({
  ports,
  type,
  position = Position.Right,
  offset,
  className,
  ...props
}: NodePortListProps) {
  const { open } = useNodeCard()

  return (
    <>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div key="ports" data-slot="node-port-list" {...nodeBodyMotion}>
            <div
              role="list"
              className={cn(
                "flex flex-col gap-3 p-3",
                "[[data-slot=node-body]+[data-slot=node-port-list]>&]:pt-0",
                className,
              )}
              {...props}
            >
              {ports.map((port) => (
                <NodePortRow
                  key={port.id}
                  port={port}
                  type={type}
                  position={position}
                  offset={offset}
                />
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      {/* After the list, so the list stays the next sibling of NodeBody. */}
      {open
        ? null
        : ports.map((port) => (
            <NodePort
              key={port.id}
              id={port.id}
              type={type}
              position={position}
              offset={offset}
              align="header"
            />
          ))}
    </>
  )
}
