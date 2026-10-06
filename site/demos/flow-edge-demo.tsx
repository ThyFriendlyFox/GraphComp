import { Position, useNodesState, type Edge, type Node, type NodeProps } from "@xyflow/react"

import { FlowCanvas } from "@/registry/graphcomp/ui/flow-canvas"
import { NodeCard, NodeHeader, NodeStatus, NodeTitle } from "@/registry/graphcomp/ui/node-card"
import { NodePort } from "@/registry/graphcomp/ui/node-port"

type StepNode = Node<{ title: string }, "step">

function Step({ data, selected }: NodeProps<StepNode>) {
  return (
    <NodeCard selected={selected} className="w-44">
      <NodePort type="target" position={Position.Left} />
      <NodePort type="source" position={Position.Right} />
      <NodeHeader>
        <NodeStatus />
        <NodeTitle eyebrow="Step">{data.title}</NodeTitle>
      </NodeHeader>
    </NodeCard>
  )
}

const nodeTypes = { step: Step }

const initialNodes: StepNode[] = [
  { id: "fetch", type: "step", position: { x: 0, y: 80 }, data: { title: "Fetch" } },
  { id: "parse", type: "step", position: { x: 260, y: 0 }, data: { title: "Parse" } },
  { id: "store", type: "step", position: { x: 260, y: 170 }, data: { title: "Store" } },
]

const edges: Edge[] = [
  { id: "fetch-parse", source: "fetch", target: "parse", data: { label: "JSON" } },
  { id: "fetch-store", source: "fetch", target: "store" },
]

export default function FlowEdgeDemo() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes)

  return (
    <FlowCanvas
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      fitView
      fitViewOptions={{ padding: 0.4, maxZoom: 1.1 }}
    />
  )
}
