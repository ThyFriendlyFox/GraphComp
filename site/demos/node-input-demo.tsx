import { useNodesState, type Node } from "@xyflow/react"

import { FlowCanvas } from "@/registry/graphcomp/ui/flow-canvas"
import {
  NodeBody,
  NodeCard,
  NodeField,
  NodeHeader,
  NodeStatus,
  NodeTitle,
} from "@/registry/graphcomp/ui/node-card"
import { NodeInput } from "@/registry/graphcomp/ui/node-input"

function Classify() {
  return (
    <NodeCard className="w-64">
      <NodeHeader>
        <NodeStatus />
        <NodeTitle eyebrow="Step">Classify Ticket</NodeTitle>
      </NodeHeader>
      <NodeBody>
        <NodeField label="Label">
          <NodeInput aria-label="Label" defaultValue="Support" />
        </NodeField>
        <NodeField label="Queue">
          <NodeInput aria-label="Queue" defaultValue="Tier 1" />
        </NodeField>
      </NodeBody>
    </NodeCard>
  )
}

const nodeTypes = { classify: Classify }

const initialNodes: Node[] = [
  { id: "classify", type: "classify", position: { x: 0, y: 0 }, data: {} },
]

export default function NodeInputDemo() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes)

  return (
    <FlowCanvas
      nodes={nodes}
      edges={[]}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      fitView
      fitViewOptions={{ padding: 1.2, maxZoom: 1.25 }}
    />
  )
}
