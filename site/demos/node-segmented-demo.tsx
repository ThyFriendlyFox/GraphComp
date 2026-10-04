import { useNodesState, type Node } from "@xyflow/react"

import { FlowCanvas } from "@/registry/graphcomp/ui/flow-canvas"
import {
  NodeBody,
  NodeCard,
  NodeHeader,
  NodeStatus,
  NodeTitle,
} from "@/registry/graphcomp/ui/node-card"
import { NodeSegmented } from "@/registry/graphcomp/ui/node-segmented"

function Mode() {
  return (
    <NodeCard className="w-60">
      <NodeHeader>
        <NodeStatus />
        <NodeTitle eyebrow="Script">On Mouse Down</NodeTitle>
      </NodeHeader>
      <NodeBody>
        <NodeSegmented
          aria-label="Mode"
          defaultValue="trigger"
          options={[
            { value: "trigger", label: "Trigger" },
            { value: "record", label: "Record" },
            { value: "loop", label: "Loop" },
          ]}
        />
      </NodeBody>
    </NodeCard>
  )
}

const nodeTypes = { mode: Mode }

const initialNodes: Node[] = [{ id: "mode", type: "mode", position: { x: 0, y: 0 }, data: {} }]

export default function NodeSegmentedDemo() {
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
