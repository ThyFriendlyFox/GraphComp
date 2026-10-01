import { useCallback } from "react"
import {
  addEdge,
  Position,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react"

import { FlowCanvas } from "@/registry/graphcomp/ui/flow-canvas"
import { NodeCard, NodeHeader, NodeStatus, NodeTitle } from "@/registry/graphcomp/ui/node-card"
import { NodePort } from "@/registry/graphcomp/ui/node-port"

type PortNode = Node<{ title: string }, "port">

function PortNodeView({ data, selected }: NodeProps<PortNode>) {
  return (
    <NodeCard selected={selected} className="w-44">
      <NodePort id="in" type="target" position={Position.Left} />
      <NodePort id="top" type="target" position={Position.Top} />
      <NodePort id="out" type="source" position={Position.Right} />
      <NodePort id="bottom" type="source" position={Position.Bottom} />
      <NodeHeader>
        <NodeStatus />
        <NodeTitle eyebrow="Ports">{data.title}</NodeTitle>
      </NodeHeader>
    </NodeCard>
  )
}

const nodeTypes = { port: PortNodeView }

const initialNodes: PortNode[] = [
  { id: "a", type: "port", position: { x: 0, y: 0 }, data: { title: "Drag from a port" } },
  { id: "b", type: "port", position: { x: 280, y: 120 }, data: { title: "Drop on a port" } },
]

export default function NodePortDemo() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const onConnect = useCallback(
    (connection: Connection) => setEdges((current) => addEdge(connection, current)),
    [setEdges],
  )

  return (
    <FlowCanvas
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView
      fitViewOptions={{ padding: 0.5, maxZoom: 1.1 }}
    />
  )
}
