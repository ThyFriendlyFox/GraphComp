import { render } from "@testing-library/react"
import { ConnectionLineType, Position, type EdgeProps } from "@xyflow/react"
import { describe, expect, it } from "vitest"

import {
  FlowStraightEdge,
  type FlowStraightEdgeType,
} from "@/registry/graphcomp/ui/flow-straight-edge"

const props = {
  id: "a-b",
  source: "a",
  target: "b",
  sourceX: 0,
  sourceY: 0,
  targetX: 200,
  targetY: 100,
  sourcePosition: Position.Right,
  targetPosition: Position.Left,
} as EdgeProps<FlowStraightEdgeType>

function renderEdge(extra: Partial<EdgeProps<FlowStraightEdgeType>> = {}) {
  return render(
    <svg>
      <FlowStraightEdge {...props} {...extra} />
    </svg>,
  )
}

describe("FlowStraightEdge", () => {
  it("draws one straight segment with a midpoint dot", () => {
    const { container } = renderEdge()
    const root = container.querySelector('[data-slot="flow-straight-edge"]')!
    expect(root.querySelector("path.react-flow__edge-path")).toHaveAttribute("d", "M 0,0L 200,100")
    expect(root.querySelector("circle")).toHaveAttribute("cx", "100")
    expect(root.querySelector("circle")).toHaveAttribute("cy", "50")
  })

  it("hides the dot when `data.dot` is false", () => {
    const { container } = renderEdge({ data: { dot: false } })
    expect(container.querySelector("circle")).toBeNull()
  })

  it("takes the accent color when selected", () => {
    const { container } = renderEdge({ selected: true })
    const path = container.querySelector<SVGPathElement>("path.react-flow__edge-path")!
    expect(path.style.stroke).toBe("var(--gc-accent)")
  })

  it("asks FlowCanvas for a straight drag line", () => {
    expect(FlowStraightEdge.connectionLineType).toBe(ConnectionLineType.Straight)
  })
})
