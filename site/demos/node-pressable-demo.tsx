import { useState } from "react"
import { useNodesState, type Node } from "@xyflow/react"
import { Pause, Play, RotateCcw } from "lucide-react"

import { FlowCanvas } from "@/registry/graphcomp/ui/flow-canvas"
import {
  NodeBody,
  NodeCard,
  NodeField,
  NodeHeader,
  NodeStatus,
  NodeTitle,
} from "@/registry/graphcomp/ui/node-card"
import { NodePressable } from "@/registry/graphcomp/ui/node-pressable"

const button =
  "grid h-8 flex-1 place-items-center rounded-gc bg-gc-inset text-gc-fg focus-visible:ring-2 focus-visible:ring-gc-ring focus-visible:outline-none [&_svg]:size-3.5"

function Player() {
  const [playing, setPlaying] = useState(false)
  const [runs, setRuns] = useState(0)

  return (
    <NodeCard className="w-56">
      <NodeHeader>
        <NodeStatus active={playing} />
        <NodeTitle eyebrow="Player">{playing ? "Running" : "Stopped"}</NodeTitle>
      </NodeHeader>
      <NodeBody>
        <div className="nodrag nokey flex gap-1">
          <NodePressable
            aria-label={playing ? "Pause" : "Play"}
            className={button}
            onClick={() => {
              setPlaying(!playing)
              if (!playing) setRuns(runs + 1)
            }}
          >
            {playing ? <Pause /> : <Play />}
          </NodePressable>
          <NodePressable
            aria-label="Reset"
            className={button}
            onClick={() => {
              setPlaying(false)
              setRuns(0)
            }}
          >
            <RotateCcw />
          </NodePressable>
        </div>
        <NodeField label="Runs">
          <span className="tabular-nums">{runs}</span>
        </NodeField>
      </NodeBody>
    </NodeCard>
  )
}

const nodeTypes = { player: Player }

const initialNodes: Node[] = [{ id: "player", type: "player", position: { x: 0, y: 0 }, data: {} }]

export default function NodePressableDemo() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes)

  return (
    <FlowCanvas
      nodes={nodes}
      edges={[]}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      fitView
      fitViewOptions={{ padding: 1.2, maxZoom: 1.25 }}
    />
  )
}
