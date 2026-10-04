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
import { NodeStepper } from "@/registry/graphcomp/ui/node-stepper"

function Settings() {
  return (
    <NodeCard className="w-60">
      <NodeHeader>
        <NodeStatus />
        <NodeTitle eyebrow="Input">On Key Press</NodeTitle>
      </NodeHeader>
      <NodeBody>
        <NodeField label="Sensitivity">
          <NodeStepper aria-label="Sensitivity" defaultValue={53} format={(value) => `${value}%`} />
        </NodeField>
        <NodeField label="Delay">
          <NodeStepper
            aria-label="Delay"
            variant="spin"
            defaultValue={2}
            max={60}
            format={(value) => `${value} sec`}
          />
        </NodeField>
      </NodeBody>
    </NodeCard>
  )
}

const nodeTypes = { settings: Settings }

const initialNodes: Node[] = [
  { id: "settings", type: "settings", position: { x: 0, y: 0 }, data: {} },
]

export default function NodeStepperDemo() {
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
