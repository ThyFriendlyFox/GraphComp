import { useCallback } from "react"
import { createRoot } from "react-dom/client"
import {
  ReactFlowProvider,
  Position,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
  type NodeProps,
  type NodeTypes,
} from "@xyflow/react"

import "../../playground/index.css"
import { FlowCanvas } from "../../registry/graphcomp/ui/flow-canvas"
import { NodePort } from "../../registry/graphcomp/ui/node-port"

type SourceData = { handleId: string; onRename?: () => void }
type TargetData = Record<string, never>
type SourceNodeType = Node<SourceData, "source">
type TargetNodeType = Node<TargetData, "target">
type FixtureNode = SourceNodeType | TargetNodeType

function SourceNode({ data }: NodeProps<SourceNodeType>) {
  return (
    <div
      className="relative grid place-items-center rounded border border-gc-node-border bg-gc-node"
      style={{ width: 200, height: 96 }}
    >
      <NodePort id={data.handleId} type="source" position={Position.Right} offset={0} />
      <span>Decision</span>
      <button
        type="button"
        className="absolute bottom-2 rounded border border-gc-node-border px-2 py-1 text-xs"
        onClick={data.onRename}
      >
        Rename answer
      </button>
    </div>
  )
}

function TargetNode() {
  return (
    <div
      className="relative grid place-items-center rounded border border-gc-node-border bg-gc-node"
      style={{ width: 160, height: 96 }}
    >
      <NodePort type="target" position={Position.Left} offset={0} />
      <span>Next step</span>
    </div>
  )
}

const nodeTypes: NodeTypes = { source: SourceNode, target: TargetNode }

const initialNodes: FixtureNode[] = [
  {
    id: "decision",
    type: "source",
    position: { x: 80, y: 100 },
    data: { handleId: "answer:Yes" },
  },
  {
    id: "next-step",
    type: "target",
    position: { x: 440, y: 100 },
    data: {},
  },
]

const initialEdges: Edge[] = [
  {
    id: "decision-next-step",
    source: "decision",
    sourceHandle: "answer:Yes",
    target: "next-step",
  },
]

function NodePortFixture() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const renameAnswer = useCallback(() => {
    setNodes((current) =>
      current.map((node) =>
        node.id === "decision" && node.type === "source"
          ? { ...node, data: { ...node.data, handleId: "answer:Up" } }
          : node,
      ),
    )
    setEdges((current) =>
      current.map((edge) =>
        edge.id === "decision-next-step" ? { ...edge, sourceHandle: "answer:Up" } : edge,
      ),
    )
  }, [setEdges, setNodes])

  const flowNodes = nodes.map((node) =>
    node.id === "decision" && node.type === "source"
      ? { ...node, data: { ...node.data, onRename: renameAnswer } }
      : node,
  )

  return (
    <div className="h-screen w-screen">
      <FlowCanvas
        nodes={flowNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        fitViewOptions={{ padding: 0.4 }}
      />
    </div>
  )
}

createRoot(document.getElementById("root")!).render(
  <ReactFlowProvider>
    <NodePortFixture />
  </ReactFlowProvider>,
)
