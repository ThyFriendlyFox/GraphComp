import type { ReactNode } from "react"
import { EdgeLabelRenderer, getSmoothStepPath, type Edge, type EdgeProps } from "@xyflow/react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

export type FlowEdgeData = {
  /** Draw a dot at the middle of the edge. Default `true`. */
  dot?: boolean
  /** Text at the middle of the edge, in place of the dot. */
  label?: ReactNode
}

export type FlowEdgeType = Edge<FlowEdgeData, "flow">

const pressSpring = { type: "spring", bounce: 0.35, duration: 0.3 } as const
const appear = {
  initial: { scale: 0 },
  animate: { scale: 1 },
  transition: { delay: 0.25, type: "spring", bounce: 0.4, duration: 0.4 },
} as const

/**
 * A right-angle edge with rounded corners and a midpoint dot or label. The
 * label renders in React Flow's HTML label layer, outside the edge's SVG. A
 * React portal still bubbles its clicks to the edge, so React Flow selects the
 * edge and calls `onEdgeClick` as it does for the path.
 */
export function FlowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  selectable,
  data,
  markerEnd,
  interactionWidth = 20,
}: EdgeProps<FlowEdgeType>) {
  const [path, midX, midY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 10,
    offset: 20,
  })
  const stroke = selected ? "var(--gc-accent)" : "var(--gc-edge)"
  const label = data?.label

  return (
    <g data-slot="flow-edge">
      <motion.path
        id={id}
        d={path}
        fill="none"
        className="react-flow__edge-path"
        markerEnd={markerEnd}
        style={{ stroke, strokeWidth: 1.25 }}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      />
      <path
        d={path}
        fill="none"
        strokeOpacity={0}
        strokeWidth={interactionWidth}
        className="react-flow__edge-interaction"
      />
      {label == null && data?.dot !== false ? (
        <motion.circle
          cx={midX}
          cy={midY}
          r={2.5}
          style={{ fill: selected ? "var(--gc-accent)" : "var(--gc-fg)" }}
          {...appear}
        />
      ) : null}
      {label != null ? (
        <EdgeLabelRenderer>
          <div
            className={cn(
              "nopan absolute",
              selectable ? "pointer-events-auto" : "pointer-events-none",
            )}
            style={{ transform: `translate(-50%, -50%) translate(${midX}px, ${midY}px)` }}
          >
            <motion.div {...appear}>
              <motion.div
                data-slot="flow-edge-label"
                data-selected={selected || undefined}
                className={cn(
                  "cursor-pointer rounded-gc border bg-gc-node-header px-1.5 text-[10px] leading-4 whitespace-nowrap",
                  selected ? "border-gc-accent text-gc-accent" : "border-gc-node-border text-gc-fg",
                )}
                whileTap={{ scale: 0.92 }}
                transition={pressSpring}
              >
                {label}
              </motion.div>
            </motion.div>
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </g>
  )
}
