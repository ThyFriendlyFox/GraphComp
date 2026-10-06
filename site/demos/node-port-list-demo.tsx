import {
  Position,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react"

import { FlowCanvas } from "@/registry/graphcomp/ui/flow-canvas"
import {
  NodeBody,
  NodeCard,
  NodeCollapseTrigger,
  NodeGrip,
  NodeHeader,
  NodePanel,
  NodeStatus,
  NodeTitle,
} from "@/registry/graphcomp/ui/node-card"
import { NodePort } from "@/registry/graphcomp/ui/node-port"
import { NodePortList } from "@/registry/graphcomp/ui/node-port-list"

type DecisionNode = Node<Record<string, never>, "decision">
type StepNode = Node<{ title: string }, "step">

const answers = [
  { id: "yes", label: "Yes" },
  { id: "no", label: "No" },
  { id: "later", label: "Later", trailing: "2 days" },
]

function Decision({ selected }: NodeProps<DecisionNode>) {
  return (
    <NodeCard selected={selected} className="w-56">
      <NodePort id="in" type="target" position={Position.Left} align="header" />
      <NodeHeader>
        <NodeStatus />
        <NodeTitle eyebrow="Branch">Decision</NodeTitle>
        <NodeCollapseTrigger />
      </NodeHeader>
      <NodeBody>
        <NodePanel>Ship this week?</NodePanel>
      </NodeBody>
      <NodePortList aria-label="Answers" type="source" ports={answers} />
      <NodeGrip />
    </NodeCard>
  )
}

function Step({ data, selected }: NodeProps<StepNode>) {
  return (
    <NodeCard selected={selected} className="w-40">
      <NodePort type="target" position={Position.Left} align="header" />
      <NodeHeader>
        <NodeStatus active={false} />
        <NodeTitle eyebrow="Step">{data.title}</NodeTitle>
      </NodeHeader>
    </NodeCard>
  )
}

const nodeTypes = { decision: Decision, step: Step }

const initialNodes: (DecisionNode | StepNode)[] = [
  { id: "decision", type: "decision", position: { x: 0, y: 30 }, data: {} },
  { id: "ship", type: "step", position: { x: 330, y: 0 }, data: { title: "Ship" } },
  { id: "drop", type: "step", position: { x: 330, y: 110 }, data: { title: "Drop" } },
  { id: "wait", type: "step", position: { x: 330, y: 220 }, data: { title: "Wait" } },
]

const initialEdges: Edge[] = [
  { id: "yes-ship", source: "decision", sourceHandle: "yes", target: "ship" },
  { id: "no-drop", source: "decision", sourceHandle: "no", target: "drop" },
  { id: "later-wait", source: "decision", sourceHandle: "later", target: "wait" },
]

export default function NodePortListDemo() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  return (
    <FlowCanvas
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      fitView
      fitViewOptions={{ padding: 0.3, maxZoom: 1.1 }}
    />
  )
}
