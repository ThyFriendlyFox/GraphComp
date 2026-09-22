import { useState } from "react"
import { Position, type Node, type NodeProps } from "@xyflow/react"

import {
  NodeBody,
  NodeCard,
  NodeCollapseTrigger,
  NodeField,
  NodeGrip,
  NodeHeader,
  NodePanel,
  NodeStatus,
  NodeTitle,
} from "@/registry/graphcomp/ui/node-card"
import { NodePort } from "@/registry/graphcomp/ui/node-port"
import { NodeSegmented } from "@/registry/graphcomp/ui/node-segmented"
import { NodeSelect } from "@/registry/graphcomp/ui/node-select"
import { NodeStepper } from "@/registry/graphcomp/ui/node-stepper"

export type EntryNodeType = Node<Record<string, never>, "entry">

/** The start of the flow: one large output dot. */
export function EntryNode() {
  return (
    <div className="grid size-9 place-items-center rounded-full bg-gc-node-header shadow-gc">
      <span className="size-5 rounded-full bg-gc-accent" />
      <NodePort type="source" position={Position.Right} offset={-4} className="opacity-0" />
    </div>
  )
}

const triggerOptions = [
  { value: "push", label: "Push Action" },
  { value: "open", label: "Open Node" },
  { value: "hold", label: "Hold", disabled: true },
] as const

type TriggerValue = (typeof triggerOptions)[number]["value"]

function TriggerCard({
  id,
  title,
  defaultOpen,
}: {
  id: string
  title: string
  defaultOpen?: boolean
}) {
  const [mode, setMode] = useState<"trigger" | "record">("trigger")

  return (
    <NodeCard defaultOpen={defaultOpen} className="w-56">
      <NodePort id={`${id}-in`} type="target" position={Position.Left} align="header" />
      <NodePort id={`${id}-out`} type="source" position={Position.Right} align="header" />
      <NodeHeader>
        <NodeStatus />
        <NodeTitle eyebrow="Script">{title}</NodeTitle>
        <NodeCollapseTrigger />
      </NodeHeader>
      <NodeBody>
        <NodeSegmented
          aria-label="Mode"
          value={mode}
          onValueChange={setMode}
          options={[
            { value: "trigger", label: "Trigger" },
            { value: "record", label: "Record" },
          ]}
        />
        <NodeField label="Trigger">
          <NodeSelect<TriggerValue>
            aria-label="Trigger"
            placeholder="Select Trigger"
            defaultValue="push"
            options={[...triggerOptions]}
          />
        </NodeField>
        <NodeField label="Delay">
          <NodeStepper
            aria-label="Delay"
            variant="spin"
            defaultValue={2}
            min={0}
            max={60}
            format={(value) => `${value} sec`}
          />
        </NodeField>
        {mode === "trigger" ? (
          <NodeField label="Sensitivity">
            <NodeStepper
              aria-label="Sensitivity"
              defaultValue={53}
              format={(value) => `${value}%`}
            />
          </NodeField>
        ) : null}
      </NodeBody>
      <NodeGrip />
    </NodeCard>
  )
}

export type TriggerStackNodeType = Node<Record<string, never>, "trigger-stack">

/**
 * Two trigger cards in one flow node. Opening the first card pushes the
 * second one down, because both share one layout column.
 */
export function TriggerStackNode() {
  return (
    <div className="flex flex-col gap-2">
      <TriggerCard id="mouse-down" title="On Mouse Down" defaultOpen={false} />
      <TriggerCard id="key-press" title="On Key Press" defaultOpen={false} />
    </div>
  )
}

export type ScriptNodeType = Node<{ title: string }, "script">

/** A custom script with an output and the event that runs it. */
export function ScriptNode({ data, selected }: NodeProps<ScriptNodeType>) {
  return (
    <NodeCard selected={selected} className="w-60">
      <NodePort type="target" position={Position.Left} align="header" />
      <NodeHeader>
        <NodeStatus />
        <NodeTitle eyebrow="Custom Script">{data.title}</NodeTitle>
        <NodeCollapseTrigger />
      </NodeHeader>
      <NodeBody>
        <NodePanel className="flex items-center gap-2.5 bg-gc-node-header">
          <NodeStatus />
          <NodeTitle eyebrow="Script">Output</NodeTitle>
        </NodePanel>
        <NodeField label="Trigger">
          <NodeSelect
            aria-label="Trigger"
            placeholder="Select Trigger"
            defaultValue="inventory"
            options={[
              { value: "inventory", label: "Open Inventory" },
              { value: "map", label: "Open Map" },
              { value: "close", label: "Close All" },
            ]}
          />
        </NodeField>
      </NodeBody>
      <NodeGrip />
    </NodeCard>
  )
}

export type ItemNodeType = Node<Record<string, never>, "item">

/** Adds an item to an inventory. */
export function ItemNode({ selected }: NodeProps<ItemNodeType>) {
  return (
    <NodeCard selected={selected} className="w-56">
      <NodePort type="target" position={Position.Left} align="header" />
      <NodeHeader>
        <NodeStatus />
        <NodeTitle eyebrow="Script">Add Item</NodeTitle>
        <NodeCollapseTrigger />
      </NodeHeader>
      <NodeBody>
        <NodeField label="Add">
          <NodeSelect
            aria-label="Item"
            placeholder="Select Item"
            defaultValue="iron"
            options={[
              { value: "iron", label: "Sm_Iron Ingot" },
              { value: "gold", label: "Sm_Gold Ingot" },
              { value: "wood", label: "Oak Plank" },
            ]}
          />
        </NodeField>
        <NodeField label="Amount">
          <NodeStepper aria-label="Amount" defaultValue={23} min={1} max={999} />
        </NodeField>
      </NodeBody>
      <NodeGrip />
    </NodeCard>
  )
}
