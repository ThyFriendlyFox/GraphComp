import { useNodesState, type Node } from "@xyflow/react"
import { Workflow } from "lucide-react"

import {
  FlowCanvas,
  FlowToolbar,
  FlowToolbarTab,
  FlowZoomControl,
} from "@/registry/graphcomp/ui/flow-canvas"

const initialNodes: Node[] = [
  { id: "a", position: { x: 0, y: 0 }, data: { label: "Source" } },
  { id: "b", position: { x: 240, y: 80 }, data: { label: "Target" } },
]

export default function FlowCanvasDemo() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes)

  return (
    <FlowCanvas
      nodes={nodes}
      edges={[{ id: "a-b", source: "a", target: "b" }]}
      onNodesChange={onNodesChange}
      fitView
      fitViewOptions={{ padding: 0.6, maxZoom: 1 }}
    >
      <FlowToolbar>
        <FlowToolbarTab icon={<Workflow />}>Untitled</FlowToolbarTab>
        <FlowZoomControl className="mx-auto" />
        <div className="w-24" />
      </FlowToolbar>
    </FlowCanvas>
  )
}
