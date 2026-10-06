import type { ComponentType } from "react"

import { toUserImports } from "../lib/registry"

const demos = import.meta.glob<ComponentType>("../demos/*.tsx", {
  import: "default",
  eager: true,
})
const demoSources = import.meta.glob<string>("../demos/*.tsx", {
  query: "?raw",
  import: "default",
  eager: true,
})

export type Prop = { name: string; type: string; default?: string; description: string }
export type Key = { keys: string; action: string }

export type ComponentDoc = {
  /** The registry item name; also the URL slug. */
  name: string
  group: "Canvas" | "Nodes" | "Widgets" | "Blocks"
  demo: ComponentType
  demoSource: string
  usage: string
  props?: { component: string; rows: Prop[] }[]
  keyboard?: Key[]
  notes?: string[]
}

function demo(name: string) {
  const path = `../demos/${name}-demo.tsx`
  return { demo: demos[path], demoSource: toUserImports(demoSources[path]) }
}

export const componentDocs: ComponentDoc[] = [
  {
    name: "flow-canvas",
    group: "Canvas",
    ...demo("flow-canvas"),
    usage: `import { FlowCanvas, FlowToolbar, FlowZoomControl } from "@/components/ui/flow-canvas"

<FlowCanvas nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView>
  <FlowToolbar>
    <FlowZoomControl className="mx-auto" />
  </FlowToolbar>
</FlowCanvas>`,
    props: [
      {
        component: "FlowCanvas",
        rows: [
          { name: "grid", type: "boolean", default: "true", description: "Draws the grid." },
          {
            name: "gridGap",
            type: "number",
            default: "24",
            description: "Grid cell size in flow units.",
          },
          {
            name: "connectionLineType",
            type: "ConnectionLineType",
            default: "shape of the default edge",
            description: "The shape of the drag line while the user connects 2 ports.",
          },
          { name: "...props", type: "ReactFlowProps", description: "Every React Flow prop." },
        ],
      },
      {
        component: "FlowZoomControl",
        rows: [{ name: "label", type: "ReactNode", description: "Replaces the zoom percentage." }],
      },
    ],
    notes: [
      "FlowCanvas registers FlowEdge as the `flow` edge type and makes it the default.",
      "The drag line has the shape of the default edge: right angles for FlowEdge.",
      "Every component inside follows the reduced motion setting of the operating system.",
      "Define `nodeTypes` at module scope. React Flow remounts every node when the object changes.",
    ],
  },
  {
    name: "flow-edge",
    group: "Canvas",
    ...demo("flow-edge"),
    usage: `const edges = [
  { id: "a-b", source: "a", target: "b" },
  { id: "a-c", source: "a", target: "c", data: { dot: false } },
]

<FlowCanvas nodes={nodes} edges={edges} />`,
    props: [
      {
        component: "FlowEdge data",
        rows: [
          {
            name: "dot",
            type: "boolean",
            default: "true",
            description: "Draws a dot at the middle of the edge.",
          },
        ],
      },
    ],
    notes: [
      "FlowCanvas uses FlowEdge for every edge. You do not register it.",
      "For curved or straight edges, use FlowBezierEdge or FlowStraightEdge.",
      "The path draws from source to target in 500 ms. The midpoint dot springs in after 250 ms.",
      "A selected edge takes the accent color.",
    ],
  },
  {
    name: "flow-bezier-edge",
    group: "Canvas",
    ...demo("flow-bezier-edge"),
    usage: `import { FlowBezierEdge } from "@/components/ui/flow-bezier-edge"

const edgeTypes = { flow: FlowBezierEdge }

<FlowCanvas nodes={nodes} edges={edges} edgeTypes={edgeTypes} />`,
    props: [
      {
        component: "FlowBezierEdge data",
        rows: [
          {
            name: "dot",
            type: "boolean",
            default: "true",
            description: "Draws a dot at the middle of the edge.",
          },
        ],
      },
    ],
    notes: [
      "Register FlowBezierEdge as the `flow` edge type to make every edge curved.",
      "The drag line curves too while FlowBezierEdge is the default edge.",
      "Define `edgeTypes` at module scope. React Flow remounts every edge when the object changes.",
      "The path draws from source to target in 500 ms. The midpoint dot springs in after 250 ms.",
      "A selected edge takes the accent color.",
    ],
  },
  {
    name: "flow-straight-edge",
    group: "Canvas",
    ...demo("flow-straight-edge"),
    usage: `import { FlowStraightEdge } from "@/components/ui/flow-straight-edge"

const edgeTypes = { flow: FlowStraightEdge }

<FlowCanvas nodes={nodes} edges={edges} edgeTypes={edgeTypes} />`,
    props: [
      {
        component: "FlowStraightEdge data",
        rows: [
          {
            name: "dot",
            type: "boolean",
            default: "true",
            description: "Draws a dot at the middle of the edge.",
          },
        ],
      },
    ],
    notes: [
      "Register FlowStraightEdge as the `flow` edge type to make every edge straight.",
      "The drag line is straight too while FlowStraightEdge is the default edge.",
      "Define `edgeTypes` at module scope. React Flow remounts every edge when the object changes.",
      "The path draws from source to target in 500 ms. The midpoint dot springs in after 250 ms.",
      "A selected edge takes the accent color.",
    ],
  },
  {
    name: "node-port",
    group: "Nodes",
    ...demo("node-port"),
    usage: `import { Position } from "@xyflow/react"
import { NodePort } from "@/components/ui/node-port"

<NodeCard>
  <NodePort type="target" position={Position.Left} align="header" />
  <NodePort type="source" position={Position.Right} align="header" />
  ...
</NodeCard>`,
    props: [
      {
        component: "NodePort",
        rows: [
          {
            name: "align",
            type: '"center" | "header"',
            default: '"center"',
            description:
              "`header` pins the port to the header row, so it stays put while the body opens.",
          },
          {
            name: "offset",
            type: "number",
            default: "14",
            description: "Distance in pixels between the node edge and the port dot.",
          },
          { name: "...props", type: "HandleProps", description: "Every React Flow `Handle` prop." },
        ],
      },
    ],
    notes: [
      "Ports in one flow node need unique `id` values.",
      "The port grows while a connection is dragged from it or over it.",
    ],
  },
  {
    name: "node-card",
    group: "Nodes",
    ...demo("node-card"),
    usage: `import {
  NodeBody,
  NodeCard,
  NodeCollapseTrigger,
  NodeField,
  NodeGrip,
  NodeHeader,
  NodeStatus,
  NodeTitle,
} from "@/components/ui/node-card"

<NodeCard selected={selected} className="w-56">
  <NodeHeader>
    <NodeStatus />
    <NodeTitle eyebrow="Timing">Delay</NodeTitle>
    <NodeCollapseTrigger />
  </NodeHeader>
  <NodeBody>
    <NodeField label="Wait">...</NodeField>
  </NodeBody>
  <NodeGrip />
</NodeCard>`,
    props: [
      {
        component: "NodeCard",
        rows: [
          {
            name: "selected",
            type: "boolean",
            description: "Pass the `selected` prop that React Flow gives a custom node.",
          },
          { name: "open", type: "boolean", description: "Controls the open state of the body." },
          {
            name: "defaultOpen",
            type: "boolean",
            default: "true",
            description: "The open state on first render.",
          },
          {
            name: "onOpenChange",
            type: "(open: boolean) => void",
            description: "Called when the body opens or closes.",
          },
        ],
      },
      {
        component: "NodeStatus",
        rows: [
          {
            name: "active",
            type: "boolean",
            default: "true",
            description: "Fills the ring with the accent dot.",
          },
        ],
      },
      {
        component: "NodeTitle",
        rows: [
          {
            name: "eyebrow",
            type: "ReactNode",
            description: "The small muted line above the title.",
          },
        ],
      },
      {
        component: "NodeField",
        rows: [
          { name: "label", type: "ReactNode", description: "The label at the start of the row." },
        ],
      },
    ],
    keyboard: [
      {
        keys: "Enter / Space",
        action: "On the header action or the grip: opens or closes the body.",
      },
    ],
    notes: [
      "NodeCard is `relative` so that ports position against it. Do not remove it.",
      "The body clips overflow only while it animates, so a NodeSelect list is not cut off.",
    ],
  },
  {
    name: "node-pressable",
    group: "Widgets",
    ...demo("node-pressable"),
    usage: `import { NodePressable } from "@/components/ui/node-pressable"

<NodePressable aria-label="Play" onClick={play}>
  <Play />
</NodePressable>`,
    props: [
      {
        component: "NodePressable",
        rows: [
          {
            name: "highlight",
            type: "boolean",
            default: "true",
            description: "Flashes an accent layer on hover and press.",
          },
          {
            name: "...props",
            type: 'HTMLMotionProps<"button">',
            description: "Every Motion button prop.",
          },
        ],
      },
    ],
    keyboard: [
      { keys: "Enter / Space", action: "Presses the button. The press motion plays too." },
    ],
    notes: [
      "Put pressables inside an element with the `nodrag` and `nokey` classes.",
      "Give an icon-only pressable an `aria-label`.",
    ],
  },
  {
    name: "node-segmented",
    group: "Widgets",
    ...demo("node-segmented"),
    usage: `import { NodeSegmented } from "@/components/ui/node-segmented"

<NodeSegmented
  aria-label="Mode"
  value={mode}
  onValueChange={setMode}
  options={[
    { value: "trigger", label: "Trigger" },
    { value: "record", label: "Record" },
  ]}
/>`,
    props: [
      {
        component: "NodeSegmented",
        rows: [
          {
            name: "options",
            type: "{ value; label; disabled? }[]",
            description: "The segments, in order.",
          },
          { name: "value", type: "T", description: "The selected value, when controlled." },
          {
            name: "defaultValue",
            type: "T",
            default: "first option",
            description: "The selected value on first render.",
          },
          {
            name: "onValueChange",
            type: "(value: T) => void",
            description: "Called when the selection changes.",
          },
        ],
      },
    ],
    keyboard: [
      { keys: "Arrow Right / Arrow Down", action: "Selects the next enabled segment." },
      { keys: "Arrow Left / Arrow Up", action: "Selects the previous enabled segment." },
    ],
  },
  {
    name: "node-select",
    group: "Widgets",
    ...demo("node-select"),
    usage: `import { NodeSelect } from "@/components/ui/node-select"

<NodeSelect
  aria-label="Trigger"
  placeholder="Select Trigger"
  defaultValue="push"
  options={[
    { value: "push", label: "Push Action" },
    { value: "open", label: "Open Node" },
  ]}
/>`,
    props: [
      {
        component: "NodeSelect",
        rows: [
          {
            name: "options",
            type: "{ value; label; disabled? }[]",
            description: "The options, in order.",
          },
          { name: "value", type: "T", description: "The selected value, when controlled." },
          { name: "defaultValue", type: "T", description: "The selected value on first render." },
          {
            name: "onValueChange",
            type: "(value: T) => void",
            description: "Called when the user picks an option.",
          },
          {
            name: "placeholder",
            type: "ReactNode",
            default: '"Select"',
            description: "Shown when nothing is selected, and as the list heading.",
          },
        ],
      },
    ],
    keyboard: [
      { keys: "Enter / Space / Arrow Up / Arrow Down", action: "Opens the list." },
      { keys: "Arrow Up / Arrow Down", action: "Moves through the enabled options." },
      { keys: "Home / End", action: "Moves to the first or the last enabled option." },
      { keys: "Enter / Space", action: "Picks the option and closes the list." },
      { keys: "Escape / Tab", action: "Closes the list." },
    ],
    notes: [
      "The list renders inside the node, not in a portal, so it pans and zooms with the canvas.",
    ],
  },
  {
    name: "node-stepper",
    group: "Widgets",
    ...demo("node-stepper"),
    usage: `import { NodeStepper } from "@/components/ui/node-stepper"

<NodeStepper aria-label="Sensitivity" defaultValue={53} format={(v) => \`\${v}%\`} />
<NodeStepper aria-label="Delay" variant="spin" defaultValue={2} format={(v) => \`\${v} sec\`} />`,
    props: [
      {
        component: "NodeStepper",
        rows: [
          { name: "value", type: "number", description: "The value, when controlled." },
          {
            name: "defaultValue",
            type: "number",
            default: "min",
            description: "The value on first render.",
          },
          {
            name: "onValueChange",
            type: "(value: number) => void",
            description: "Called when the value changes.",
          },
          { name: "min", type: "number", default: "0", description: "The lowest value." },
          { name: "max", type: "number", default: "100", description: "The highest value." },
          { name: "step", type: "number", default: "1", description: "The change for one press." },
          {
            name: "format",
            type: "(value: number) => string",
            default: "String",
            description: "Turns the number into display text.",
          },
          {
            name: "variant",
            type: '"inline" | "spin"',
            default: '"inline"',
            description: "`inline`: minus, value, plus. `spin`: value with arrows at the end.",
          },
        ],
      },
    ],
    keyboard: [
      { keys: "Arrow Up / Arrow Right", action: "Adds one step." },
      { keys: "Arrow Down / Arrow Left", action: "Removes one step." },
      { keys: "Page Up / Page Down", action: "Adds or removes 10 steps." },
      { keys: "Home / End", action: "Sets the lowest or the highest value." },
    ],
  },
  {
    name: "event-flow",
    group: "Blocks",
    ...demo("event-flow"),
    usage: `import { ReactFlowProvider } from "@xyflow/react"
import { EventFlow } from "@/components/event-flow/event-flow"

export default function Page() {
  return (
    <div className="h-screen">
      <ReactFlowProvider>
        <EventFlow />
      </ReactFlowProvider>
    </div>
  )
}`,
    notes: [
      "The block installs every component it uses.",
      "Opening a trigger pushes the trigger below it down, because both share one layout column.",
    ],
  },
]

export function componentDoc(name: string) {
  return componentDocs.find((doc) => doc.name === name)
}
