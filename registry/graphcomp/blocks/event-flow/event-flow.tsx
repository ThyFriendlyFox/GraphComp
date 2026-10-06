import { useCallback, useMemo, useState } from "react"
import {
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type EdgeTypes,
  type NodeTypes,
} from "@xyflow/react"
import { Workflow } from "lucide-react"

import {
  FlowCanvas,
  FlowToolbar,
  FlowToolbarTab,
  FlowZoomControl,
} from "@/registry/graphcomp/ui/flow-canvas"
import { FlowBezierEdge } from "@/registry/graphcomp/ui/flow-bezier-edge"
import { FlowStraightEdge } from "@/registry/graphcomp/ui/flow-straight-edge"
import { NodeSegmented } from "@/registry/graphcomp/ui/node-segmented"
import {
  EntryNode,
  ItemNode,
  ScriptNode,
  TriggerStackNode,
  type EntryNodeType,
  type ItemNodeType,
  type ScriptNodeType,
  type TriggerStackNodeType,
} from "./event-nodes"

type EventFlowNode = EntryNodeType | TriggerStackNodeType | ScriptNodeType | ItemNodeType

const nodeTypes: NodeTypes = {
  entry: EntryNode,
  "trigger-stack": TriggerStackNode,
  script: ScriptNode,
  item: ItemNode,
}

const edgeTypes: EdgeTypes = { "flow-bezier": FlowBezierEdge, "flow-straight": FlowStraightEdge }

type EdgeStyle = "flow" | "flow-bezier" | "flow-straight"

const edgeStyles: { value: EdgeStyle; label: string }[] = [
  { value: "flow", label: "Angle" },
  { value: "flow-bezier", label: "Curve" },
  { value: "flow-straight", label: "Straight" },
]

const initialNodes: EventFlowNode[] = [
  { id: "entry", type: "entry", position: { x: 0, y: 0 }, data: {} },
  { id: "triggers", type: "trigger-stack", position: { x: 140, y: 150 }, data: {} },
  {
    id: "inventory",
    type: "script",
    position: { x: 500, y: 60 },
    data: { title: "Amend Inventory" },
  },
  { id: "item", type: "item", position: { x: 540, y: 300 }, data: {} },
]

const initialEdges: Edge[] = [
  { id: "entry-mouse", source: "entry", target: "triggers", targetHandle: "mouse-down-in" },
  {
    id: "mouse-inventory",
    source: "triggers",
    sourceHandle: "mouse-down-out",
    target: "inventory",
  },
  { id: "key-item", source: "triggers", sourceHandle: "key-press-out", target: "item" },
]

/** A game event flow: an entry point, two triggers, and the scripts they run. */
export function EventFlow({ className }: { className?: string }) {
  const [nodes, , onNodesChange] = useNodesState<EventFlowNode>(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const onConnect = useCallback(
    (connection: Connection) => setEdges((current) => addEdge(connection, current)),
    [setEdges],
  )
  const [edgeStyle, setEdgeStyle] = useState<EdgeStyle>("flow")
  const defaultEdgeOptions = useMemo(() => ({ type: edgeStyle }), [edgeStyle])

  return (
    <FlowCanvas
      className={className}
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      defaultEdgeOptions={defaultEdgeOptions}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView
      fitViewOptions={{ padding: 0.35, maxZoom: 1.25 }}
    >
      <FlowToolbar>
        <FlowToolbarTab icon={<Workflow />}>Flow Graph</FlowToolbarTab>
        <FlowZoomControl className="mx-auto" />
        <NodeSegmented
          aria-label="Edge style"
          options={edgeStyles}
          value={edgeStyle}
          onValueChange={setEdgeStyle}
          className="h-7"
        />
      </FlowToolbar>
    </FlowCanvas>
  )
}
