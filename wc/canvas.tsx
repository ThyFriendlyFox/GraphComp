import {
  Position,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type NodeProps,
  type NodeTypes,
  type ReactFlowInstance,
} from "@xyflow/react"

import {
  EntryNode,
  ItemNode,
  ScriptNode,
  TriggerStackNode,
} from "@/registry/graphcomp/blocks/event-flow/event-nodes"
import { FlowCanvas } from "@/registry/graphcomp/ui/flow-canvas"
import { NodeCard, NodeHeader, NodeStatus, NodeTitle } from "@/registry/graphcomp/ui/node-card"
import { NodePort } from "@/registry/graphcomp/ui/node-port"

export type CardNodeData = {
  title: string
  eyebrow?: string
  /** Draw the input port on the left. Default `true`. */
  input?: boolean
  /** Draw the output port on the right. Default `true`. */
  output?: boolean
}

/** A node with a header only: a status ring, a title and up to 2 ports. */
function CardNode({ data, selected }: NodeProps<Node<CardNodeData, "card">>) {
  return (
    <NodeCard selected={selected} defaultOpen={false} className="w-56">
      {data.input !== false ? (
        <NodePort type="target" position={Position.Left} align="header" />
      ) : null}
      {data.output !== false ? (
        <NodePort type="source" position={Position.Right} align="header" />
      ) : null}
      <NodeHeader>
        <NodeStatus />
        <NodeTitle eyebrow={data.eyebrow}>{data.title}</NodeTitle>
      </NodeHeader>
    </NodeCard>
  )
}

// Module scope: React Flow remounts every node when this object changes.
// A node without a type, or with an unknown type, renders as a card.
const nodeTypes: NodeTypes = {
  default: CardNode,
  card: CardNode,
  entry: EntryNode,
  "trigger-stack": TriggerStackNode,
  script: ScriptNode,
  item: ItemNode,
}

export const fitViewOptions = { padding: 0.25, maxZoom: 1.25 }

export type CanvasProps = {
  nodes: Node[]
  edges: Edge[]
  grid: boolean
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void
  onInit: (instance: ReactFlowInstance) => void
}

export function Canvas(props: CanvasProps) {
  return <FlowCanvas {...props} nodeTypes={nodeTypes} fitView fitViewOptions={fitViewOptions} />
}
