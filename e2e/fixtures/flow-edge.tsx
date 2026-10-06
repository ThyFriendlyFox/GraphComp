import { createRoot } from "react-dom/client"
import {
  ReactFlowProvider,
  Position,
  useEdgesState,
  useNodesState,
  type Node,
  type NodeProps,
  type NodeTypes,
} from "@xyflow/react"

import "../../playground/index.css"
import { FlowCanvas } from "../../registry/graphcomp/ui/flow-canvas"
import type { FlowEdgeType } from "../../registry/graphcomp/ui/flow-edge"
import { NodePort } from "../../registry/graphcomp/ui/node-port"

type StepNodeType = Node<{ title: string }, "decision" | "step">

function DecisionNode({ data }: NodeProps<StepNodeType>) {
  return (
    <div
      className="relative grid place-items-center rounded border border-gc-node-border bg-gc-node"
      style={{ width: 160, height: 96 }}
    >
      <NodePort id="yes" type="source" position={Position.Right} offset={0} style={{ top: 24 }} />
      <NodePort id="no" type="source" position={Position.Right} offset={0} style={{ top: 72 }} />
      <span>{data.title}</span>
    </div>
  )
}

function StepNode({ data }: NodeProps<StepNodeType>) {
  return (
    <div
      className="relative grid place-items-center rounded border border-gc-node-border bg-gc-node"
      style={{ width: 160, height: 64 }}
    >
      <NodePort type="target" position={Position.Left} offset={0} />
      <NodePort type="source" position={Position.Right} offset={0} />
      <span>{data.title}</span>
    </div>
  )
}

const nodeTypes: NodeTypes = { decision: DecisionNode, step: StepNode }

const initialNodes: StepNodeType[] = [
  { id: "check", type: "decision", position: { x: 0, y: 140 }, data: { title: "Tests pass?" } },
  { id: "fix", type: "step", position: { x: 420, y: 0 }, data: { title: "Fix" } },
  { id: "ship", type: "step", position: { x: 420, y: 320 }, data: { title: "Ship" } },
  { id: "notify", type: "step", position: { x: 820, y: 320 }, data: { title: "Notify" } },
]

// The "yes" port sits above the "no" port, but "yes" leads down and "no"
// leads up, so the 2 branch edges cross.
const initialEdges: FlowEdgeType[] = [
  { id: "yes", source: "check", sourceHandle: "yes", target: "ship", data: { label: "Yes" } },
  { id: "no", source: "check", sourceHandle: "no", target: "fix", data: { label: "No" } },
  { id: "ship-notify", source: "ship", target: "notify" },
]

function FlowEdgeFixture() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  return (
    <div className="h-screen w-screen">
      <FlowCanvas
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onEdgeClick={(_, edge) => (document.body.dataset.clickedEdge = edge.id)}
        defaultViewport={{ x: 160, y: 200, zoom: 1 }}
      />
    </div>
  )
}

createRoot(document.getElementById("root")!).render(
  <ReactFlowProvider>
    <FlowEdgeFixture />
  </ReactFlowProvider>,
)
