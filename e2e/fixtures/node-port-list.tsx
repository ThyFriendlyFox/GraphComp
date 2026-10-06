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
import {
  NodeBody,
  NodeCard,
  NodeCollapseTrigger,
  NodeGrip,
  NodeHeader,
  NodePanel,
  NodeStatus,
  NodeTitle,
} from "../../registry/graphcomp/ui/node-card"
import { NodePort } from "../../registry/graphcomp/ui/node-port"
import { NodePortList } from "../../registry/graphcomp/ui/node-port-list"

type DecisionNodeType = Node<Record<string, never>, "decision">
type StepNodeType = Node<{ title: string }, "step">
type FixtureNode = DecisionNodeType | StepNodeType

const answers = [
  { id: "answer:yes", label: "Yes" },
  { id: "answer:no", label: "No" },
  { id: "answer:later", label: "Later", trailing: "2 days" },
]

function DecisionNode({ selected }: NodeProps<DecisionNodeType>) {
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

function StepNode({ data, selected }: NodeProps<StepNodeType>) {
  return (
    <NodeCard selected={selected} className="w-44">
      <NodePort type="target" position={Position.Left} align="header" />
      <NodeHeader>
        <NodeTitle eyebrow="Step">{data.title}</NodeTitle>
      </NodeHeader>
    </NodeCard>
  )
}

const nodeTypes: NodeTypes = { decision: DecisionNode, step: StepNode }

const initialNodes: FixtureNode[] = [
  { id: "decision", type: "decision", position: { x: 0, y: 40 }, data: {} },
  { id: "ship", type: "step", position: { x: 380, y: 0 }, data: { title: "Ship" } },
  { id: "drop", type: "step", position: { x: 380, y: 120 }, data: { title: "Drop" } },
  { id: "wait", type: "step", position: { x: 380, y: 240 }, data: { title: "Wait" } },
]

const initialEdges: Edge[] = [
  { id: "yes-ship", source: "decision", sourceHandle: "answer:yes", target: "ship" },
  { id: "no-drop", source: "decision", sourceHandle: "answer:no", target: "drop" },
  { id: "later-wait", source: "decision", sourceHandle: "answer:later", target: "wait" },
]

function NodePortListFixture() {
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
        fitView
        fitViewOptions={{ padding: 0.3, maxZoom: 1 }}
      />
    </div>
  )
}

createRoot(document.getElementById("root")!).render(
  <ReactFlowProvider>
    <NodePortListFixture />
  </ReactFlowProvider>,
)
