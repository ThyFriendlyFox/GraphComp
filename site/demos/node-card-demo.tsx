import { Position, useNodesState, type Node, type NodeProps } from "@xyflow/react"

import { FlowCanvas } from "@/registry/graphcomp/ui/flow-canvas"
import {
  NodeBody,
  NodeCard,
  NodeCollapseTrigger,
  NodeField,
  NodeGrip,
  NodeHeader,
  NodePanel,
  NodeStatus,
  NodeTitle,
} from "@/registry/graphcomp/ui/node-card"
import { NodePort } from "@/registry/graphcomp/ui/node-port"
import { NodeStepper } from "@/registry/graphcomp/ui/node-stepper"

type DelayNode = Node<Record<string, never>, "delay">

function Delay({ selected }: NodeProps<DelayNode>) {
  return (
    <NodeCard selected={selected} className="w-56">
      <NodePort type="target" position={Position.Left} align="header" />
      <NodePort type="source" position={Position.Right} align="header" />
      <NodeHeader>
        <NodeStatus />
        <NodeTitle eyebrow="Timing">Delay</NodeTitle>
        <NodeCollapseTrigger />
      </NodeHeader>
      <NodeBody>
        <NodePanel className="flex items-center gap-2.5 bg-gc-node-header">
          <NodeStatus active={false} />
          <NodeTitle eyebrow="Output">Done</NodeTitle>
        </NodePanel>
        <NodeField label="Wait">
          <NodeStepper
            aria-label="Wait"
            variant="spin"
            defaultValue={2}
            format={(value) => `${value} sec`}
          />
        </NodeField>
      </NodeBody>
      <NodeGrip />
    </NodeCard>
  )
}

const nodeTypes = { delay: Delay }

const initialNodes: DelayNode[] = [
  { id: "delay", type: "delay", position: { x: 0, y: 0 }, data: {} },
]

export default function NodeCardDemo() {
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
