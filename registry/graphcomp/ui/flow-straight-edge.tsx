import { ConnectionLineType, getStraightPath, type Edge, type EdgeProps } from "@xyflow/react"
import { motion } from "motion/react"

export type FlowStraightEdgeData = {
  /** Draw a dot at the middle of the edge. Default `true`. */
  dot?: boolean
}

export type FlowStraightEdgeType = Edge<FlowStraightEdgeData, "flow-straight">

/** A straight edge with a midpoint dot. */
export function FlowStraightEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  selected,
  data,
  markerEnd,
  interactionWidth = 20,
}: EdgeProps<FlowStraightEdgeType>) {
  const [path, midX, midY] = getStraightPath({ sourceX, sourceY, targetX, targetY })
  const stroke = selected ? "var(--gc-accent)" : "var(--gc-edge)"

  return (
    <g data-slot="flow-straight-edge">
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

/** `FlowCanvas` draws the drag line in this shape while this edge is the default. */
FlowStraightEdge.connectionLineType = ConnectionLineType.Straight
