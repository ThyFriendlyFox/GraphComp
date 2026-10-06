import { useCallback, useState } from "react"
import { createRoot } from "react-dom/client"
import {
  addEdge,
  Position,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
  type NodeTypes,
} from "@xyflow/react"

import "../../playground/index.css"
import { FlowCanvas } from "../../registry/graphcomp/ui/flow-canvas"
import { NodePort } from "../../registry/graphcomp/ui/node-port"

type LabelData = { label: string }
type FixtureNode = Node<LabelData>

const box = "relative grid place-items-center rounded border border-gc-node-border bg-gc-node"

function SourceNode({ data }: NodeProps<FixtureNode>) {
  return (
    <div className={box} style={{ width: 200, height: 96 }}>
      <NodePort id="out" type="source" position={Position.Right} offset={0} />
      <span>{data.label}</span>
    </div>
  )
}

function MergeNode({ data }: NodeProps<FixtureNode>) {
  return (
    <div className={box} style={{ width: 200, height: 120 }}>
      <NodePort id="a" type="target" position={Position.Left} offset={0} style={{ top: 30 }} />
      <NodePort id="b" type="target" position={Position.Left} offset={0} style={{ top: 90 }} />
      <span>{data.label}</span>
    </div>
  )
}

function TargetNode({ data }: NodeProps<FixtureNode>) {
  return (
    <div className={box} style={{ width: 200, height: 96 }}>
      <NodePort id="in" type="target" position={Position.Left} offset={0} />
      <span>{data.label}</span>
    </div>
  )
}

const nodeTypes: NodeTypes = { source: SourceNode, merge: MergeNode, target: TargetNode }

const initialNodes: FixtureNode[] = [
  { id: "decision", type: "source", position: { x: 0, y: 0 }, data: { label: "Decision" } },
  { id: "other", type: "source", position: { x: 0, y: 220 }, data: { label: "Other" } },
  { id: "merge", type: "merge", position: { x: 380, y: 0 }, data: { label: "Merge" } },
  { id: "blocked", type: "target", position: { x: 380, y: 220 }, data: { label: "Blocked" } },
]

const initialEdges: Edge[] = [
  { id: "other-merge", source: "other", sourceHandle: "out", target: "merge", targetHandle: "a" },
]

const isValidConnection = (connection: Edge | Connection) => connection.target !== "blocked"

function ConnectOnNodeDropFixture() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const onConnect = useCallback(
    (connection: Connection) => setEdges((current) => addEdge(connection, current)),
    [setEdges],
  )
  const [connectEnds, setConnectEnds] = useState(0)
  const onConnectEnd = useCallback(() => setConnectEnds((count) => count + 1), [])

  return (
    <div className="h-screen w-screen">
      <FlowCanvas
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectEnd={onConnectEnd}
        isValidConnection={isValidConnection}
        connectOnNodeDrop
        fitView
        fitViewOptions={{ padding: 0.3, maxZoom: 1 }}
      />
      <output data-testid="edges" className="sr-only">
        {edges
          .map((edge) => `${edge.source}:${edge.sourceHandle}->${edge.target}:${edge.targetHandle}`)
          .join(" ")}
      </output>
      <output data-testid="connect-ends" className="sr-only">
        {connectEnds}
      </output>
    </div>
  )
}

createRoot(document.getElementById("root")!).render(
  <ReactFlowProvider>
    <ConnectOnNodeDropFixture />
  </ReactFlowProvider>,
)
