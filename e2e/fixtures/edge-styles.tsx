import { createRoot } from "react-dom/client"
import {
  ConnectionLineType,
  ReactFlowProvider,
  Position,
  useNodesState,
  type Edge,
  type EdgeTypes,
  type Node,
  type NodeProps,
  type NodeTypes,
} from "@xyflow/react"

import "../../playground/index.css"
import { FlowBezierEdge } from "../../registry/graphcomp/ui/flow-bezier-edge"
import { FlowCanvas } from "../../registry/graphcomp/ui/flow-canvas"
import { FlowStraightEdge } from "../../registry/graphcomp/ui/flow-straight-edge"
import { NodePort } from "../../registry/graphcomp/ui/node-port"

// `?edge=bezier` or `?edge=straight` makes that edge the `flow` edge type.
// Without it, FlowCanvas keeps FlowEdge. `?line=bezier` passes
// `connectionLineType` to FlowCanvas.
const params = new URLSearchParams(location.search)
const choice = params.get("edge")
const connectionLineType = params.get("line") === "bezier" ? ConnectionLineType.Bezier : undefined
const edgeTypes: EdgeTypes | undefined =
  choice === "bezier"
    ? { flow: FlowBezierEdge }
    : choice === "straight"
      ? { flow: FlowStraightEdge }
      : undefined

type BoxNode = Node<{ label: string }, "box">

function Box({ data }: NodeProps<BoxNode>) {
  return (
    <div
      className="relative grid place-items-center rounded border border-gc-node-border bg-gc-node"
      style={{ width: 160, height: 96 }}
    >
      <NodePort type="target" position={Position.Left} offset={0} />
      <NodePort type="source" position={Position.Right} offset={0} />
      <span>{data.label}</span>
    </div>
  )
}

const nodeTypes: NodeTypes = { box: Box }

const initialNodes: BoxNode[] = [
  { id: "a", type: "box", position: { x: 0, y: 0 }, data: { label: "A" } },
  { id: "b", type: "box", position: { x: 360, y: 160 }, data: { label: "B" } },
  { id: "c", type: "box", position: { x: 0, y: 320 }, data: { label: "C" } },
]

const edges: Edge[] = [{ id: "a-b", source: "a", target: "b" }]

function EdgeStylesFixture() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes)

  return (
    <div className="h-screen w-screen">
      <FlowCanvas
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionLineType={connectionLineType}
        onNodesChange={onNodesChange}
        defaultViewport={{ x: 200, y: 100, zoom: 1 }}
      />
    </div>
  )
}

createRoot(document.getElementById("root")!).render(
  <ReactFlowProvider>
    <EdgeStylesFixture />
  </ReactFlowProvider>,
)
