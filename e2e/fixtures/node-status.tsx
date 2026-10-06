import { useState } from "react"
import { createRoot } from "react-dom/client"
import { ReactFlowProvider, type Node, type NodeProps, type NodeTypes } from "@xyflow/react"

import "../../playground/index.css"
import { FlowCanvas } from "../../registry/graphcomp/ui/flow-canvas"
import {
  NodeCard,
  NodeHeader,
  NodeStatus,
  NodeTitle,
  type NodeRunState,
} from "../../registry/graphcomp/ui/node-card"

type StepData = { title: string; state: NodeRunState }
type StepNode = Node<StepData, "step">

function Step({ data }: NodeProps<StepNode>) {
  return (
    <NodeCard runState={data.state} className="w-44">
      <NodeHeader>
        <NodeStatus state={data.state} />
        <NodeTitle eyebrow="Step">{data.title}</NodeTitle>
      </NodeHeader>
    </NodeCard>
  )
}

const nodeTypes: NodeTypes = { step: Step }
const states: NodeRunState[] = ["idle", "running", "done", "error"]

function NodeStatusFixture() {
  const [deploy, setDeploy] = useState<NodeRunState>("idle")

  const nodes: StepNode[] = [
    ...states.map((state, index) => ({
      id: state,
      type: "step" as const,
      position: { x: index * 200, y: 0 },
      data: { title: state[0].toUpperCase() + state.slice(1), state },
    })),
    {
      id: "deploy",
      type: "step",
      position: { x: 300, y: 120 },
      data: { title: "Deploy", state: deploy },
    },
  ]

  return (
    <div className="h-screen w-screen">
      <div className="absolute top-2 left-2 z-10 flex gap-2">
        {states.map((state) => (
          <button
            key={state}
            type="button"
            className="rounded border border-gc-node-border px-2 py-1 text-xs"
            onClick={() => setDeploy(state)}
          >
            Deploy {state}
          </button>
        ))}
      </div>
      <FlowCanvas
        nodes={nodes}
        edges={[]}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      />
    </div>
  )
}

createRoot(document.getElementById("root")!).render(
  <ReactFlowProvider>
    <NodeStatusFixture />
  </ReactFlowProvider>,
)
