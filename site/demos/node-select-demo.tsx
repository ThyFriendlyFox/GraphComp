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
import { NodeSelect } from "@/registry/graphcomp/ui/node-select"

function Trigger() {
  return (
    <NodeCard className="w-60">
      <NodeHeader>
        <NodeStatus />
        <NodeTitle eyebrow="Script">Open Inventory</NodeTitle>
      </NodeHeader>
      <NodeBody>
        <NodeField label="Trigger">
          <NodeSelect
            aria-label="Trigger"
            placeholder="Select Trigger"
            defaultValue="push"
            options={[
              { value: "push", label: "Push Action" },
              { value: "open", label: "Open Node" },
              { value: "hold", label: "Hold", disabled: true },
            ]}
          />
        </NodeField>
      </NodeBody>
    </NodeCard>
  )
}

const nodeTypes = { trigger: Trigger }

const initialNodes: Node[] = [
  { id: "trigger", type: "trigger", position: { x: 0, y: 0 }, data: {} },
]

export default function NodeSelectDemo() {
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
