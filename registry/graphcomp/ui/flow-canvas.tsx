import { useMemo, type ComponentProps, type ReactNode } from "react"
import {
  Background,
  BackgroundVariant,
  ReactFlow,
  useReactFlow,
  useStore,
  type Edge,
  type EdgeTypes,
  type Node,
  type ReactFlowProps,
} from "@xyflow/react"
import { MotionConfig } from "motion/react"
import { Minus, Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import { FlowEdge } from "@/registry/graphcomp/ui/flow-edge"

type FlowCanvasProps<N extends Node, E extends Edge> = ReactFlowProps<N, E> & {
  /** Draw the grid. Default `true`. */
  grid?: boolean
  /** Grid cell size in flow units. */
  gridGap?: number
}

/**
 * React Flow, themed by GraphComp tokens. Registers `FlowEdge` as the `flow`
 * edge type and makes it the default. Motion respects the OS reduced-motion
 * setting for every component inside.
 */
export function FlowCanvas<N extends Node = Node, E extends Edge = Edge>({
  grid = true,
  gridGap = 24,
  edgeTypes,
  defaultEdgeOptions,
  className,
  children,
  ...props
}: FlowCanvasProps<N, E>) {
  const mergedEdgeTypes = useMemo<EdgeTypes>(() => ({ flow: FlowEdge, ...edgeTypes }), [edgeTypes])
  const mergedEdgeOptions = useMemo(
    () => ({ type: "flow", ...defaultEdgeOptions }),
    [defaultEdgeOptions],
  )

  return (
    <MotionConfig reducedMotion="user">
      <ReactFlow<N, E>
        className={cn("gc-canvas bg-gc-canvas", className)}
        edgeTypes={mergedEdgeTypes}
        defaultEdgeOptions={mergedEdgeOptions}
        connectionLineStyle={{ stroke: "var(--gc-accent)", strokeWidth: 1.25 }}
        {...props}
      >
        {grid ? (
          <Background
            variant={BackgroundVariant.Lines}
            gap={gridGap}
            lineWidth={1}
            color="var(--gc-grid)"
          />
        ) : null}
        {children}
      </ReactFlow>
    </MotionConfig>
  )
}

/** A bar across the top of the canvas. */
export function FlowToolbar({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="flow-toolbar"
      className={cn(
        "absolute inset-x-0 top-0 z-10 flex h-10 items-center gap-2 border-b border-gc-node-border/60",
        "bg-gc-node-header/90 px-2 text-[12px] text-gc-fg backdrop-blur-sm",
        className,
      )}
      {...props}
    />
  )
}

/** A labeled tab in the toolbar, such as the name of the open graph. */
export function FlowToolbarTab({
  icon,
  className,
  children,
  ...props
}: ComponentProps<"div"> & { icon?: ReactNode }) {
  return (
    <div
      data-slot="flow-toolbar-tab"
      className={cn(
        "flex h-full items-center gap-2 border-r border-gc-node-border/60 pr-4 pl-2 [&_svg]:size-3.5",
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </div>
  )
}

const zoomSelector = (state: { transform: [number, number, number] }) => state.transform[2]

/** Zoom out, the current zoom level, zoom in. */
export function FlowZoomControl({
  label,
  className,
  ...props
}: ComponentProps<"div"> & { label?: ReactNode }) {
  const { zoomIn, zoomOut } = useReactFlow()
  const zoom = useStore(zoomSelector)
  const button =
    "grid size-7 place-items-center text-gc-muted transition-colors hover:text-gc-fg focus-visible:ring-2 focus-visible:ring-gc-ring focus-visible:outline-none [&_svg]:size-3.5"

  return (
    <div
      data-slot="flow-zoom-control"
      className={cn(
        "flex h-7 items-center rounded-gc bg-gc-inset/70 text-[12px] text-gc-fg",
        className,
      )}
      {...props}
    >
      <button
        type="button"
        aria-label="Zoom out"
        className={button}
        onClick={() => zoomOut({ duration: 200 })}
      >
        <Minus />
      </button>
      <span aria-live="polite" className="min-w-20 px-2 text-center tabular-nums">
        {label ?? `${Math.round(zoom * 100)}%`}
      </span>
      <button
        type="button"
        aria-label="Zoom in"
        className={button}
        onClick={() => zoomIn({ duration: 200 })}
      >
        <Plus />
      </button>
    </div>
  )
}
