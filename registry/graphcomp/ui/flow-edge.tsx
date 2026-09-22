import { getSmoothStepPath, type Edge, type EdgeProps } from "@xyflow/react"
import { motion } from "motion/react"

export type FlowEdgeData = {
  /** Draw a dot at the middle of the edge. Default `true`. */
  dot?: boolean
}

export type FlowEdgeType = Edge<FlowEdgeData, "flow">

/** A right-angle edge with rounded corners and a midpoint dot. */
export function FlowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
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
      {data?.dot !== false ? (
        <motion.circle
          cx={midX}
          cy={midY}
          r={2.5}
          style={{ fill: selected ? "var(--gc-accent)" : "var(--gc-fg)" }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.25, type: "spring", bounce: 0.4, duration: 0.4 }}
        />
      ) : null}
    </g>
  )
}
