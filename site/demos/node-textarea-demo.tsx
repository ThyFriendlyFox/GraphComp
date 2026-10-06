import { useNodesState, type Node } from "@xyflow/react"

import { FlowCanvas } from "@/registry/graphcomp/ui/flow-canvas"
import {
  NodeBody,
  NodeCard,
  NodeHeader,
  NodeStatus,
  NodeTitle,
} from "@/registry/graphcomp/ui/node-card"
import { NodeTextarea } from "@/registry/graphcomp/ui/node-textarea"

function Prompt() {
  return (
    <NodeCard className="w-64">
      <NodeHeader>
        <NodeStatus />
        <NodeTitle eyebrow="Prompt">Ask Model</NodeTitle>
      </NodeHeader>
      <NodeBody>
        <NodeTextarea aria-label="Instruction" maxRows={8} defaultValue="Summarize the ticket." />
      </NodeBody>
    </NodeCard>
  )
}

const nodeTypes = { prompt: Prompt }

const initialNodes: Node[] = [{ id: "prompt", type: "prompt", position: { x: 0, y: 0 }, data: {} }]

export default function NodeTextareaDemo() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes)

  return (
    <FlowCanvas
      nodes={nodes}
      edges={[]}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      fitView
      fitViewOptions={{ padding: 1.4, maxZoom: 1.25 }}
    />
  )
}
