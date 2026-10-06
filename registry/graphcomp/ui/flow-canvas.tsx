import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  type ComponentProps,
  type ReactNode,
  type RefObject,
} from "react"
import {
  Background,
  BackgroundVariant,
  ReactFlow,
  ViewportPortal,
  useReactFlow,
  useStore,
  useStoreApi,
  type Connection,
  type Edge,
  type EdgeTypes,
  type FinalConnectionState,
  type Handle,
  type HandleType,
  type InternalNode,
  type Node,
  type ReactFlowProps,
  type ReactFlowState,
  type XYPosition,
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
  /**
   * Letting go of a connection over a node connects it to the node's first
   * free port of the matching type. Default `false`.
   */
  connectOnNodeDrop?: boolean
}

type ConnectEnd = (event: MouseEvent | TouchEvent, state: FinalConnectionState) => void

/**
 * React Flow, themed by GraphComp tokens. Registers `FlowEdge` as the `flow`
 * edge type and makes it the default. Motion respects the OS reduced-motion
 * setting for every component inside.
 */
export function FlowCanvas<N extends Node = Node, E extends Edge = Edge>({
  grid = true,
  gridGap = 24,
  connectOnNodeDrop = false,
  edgeTypes,
  defaultEdgeOptions,
  onConnectEnd,
  className,
  children,
  ...props
}: FlowCanvasProps<N, E>) {
  const mergedEdgeTypes = useMemo<EdgeTypes>(() => ({ flow: FlowEdge, ...edgeTypes }), [edgeTypes])
  const mergedEdgeOptions = useMemo(
    () => ({ type: "flow", ...defaultEdgeOptions }),
    [defaultEdgeOptions],
  )
  // The drop handler needs the flow store, which exists only inside ReactFlow.
  const dropOnNode = useRef<ConnectEnd | null>(null)
  const handleConnectEnd = useCallback<NonNullable<typeof onConnectEnd>>(
    (event, state) => {
      dropOnNode.current?.(event, state)
      onConnectEnd?.(event, state)
    },
    [onConnectEnd],
  )

  return (
    <MotionConfig reducedMotion="user">
      <ReactFlow<N, E>
        className={cn("gc-canvas bg-gc-canvas", className)}
        edgeTypes={mergedEdgeTypes}
        defaultEdgeOptions={mergedEdgeOptions}
        connectionLineStyle={{ stroke: "var(--gc-accent)", strokeWidth: 1.25 }}
        {...props}
        onConnectEnd={connectOnNodeDrop ? handleConnectEnd : onConnectEnd}
      >
        {grid ? (
          <Background
            variant={BackgroundVariant.Lines}
            gap={gridGap}
            lineWidth={1}
            color="var(--gc-grid)"
          />
        ) : null}
        {connectOnNodeDrop ? <NodeDropConnector handlerRef={dropOnNode} /> : null}
        {children}
      </ReactFlow>
    </MotionConfig>
  )
}

const DROP_RING_GAP = 4

/** Connects a connection dropped on a node body, and rings the node under the pointer. */
function NodeDropConnector({ handlerRef }: { handlerRef: RefObject<ConnectEnd | null> }) {
  const store = useStoreApi()
  const targetId = useStore(dropTargetSelector)
  const target = useStore((state) => (targetId ? state.nodeLookup.get(targetId) : undefined))

  useLayoutEffect(() => {
    handlerRef.current = (_event, connection) => {
      // React Flow already connected on a port, or no drag took place.
      if (connection.isValid || !connection.fromHandle || !connection.pointer) return
      const state = store.getState()
      const drop = findDrop(state, connection.pointer, connection.fromHandle)
      if (drop) state.onConnect?.(drop.connection)
    }
    return () => {
      handlerRef.current = null
    }
  }, [handlerRef, store])

  if (!target) return null
  const { x, y } = target.internals.positionAbsolute
  const { width = 0, height = 0 } = target.measured

  return (
    <ViewportPortal>
      <div
        aria-hidden
        data-slot="flow-drop-target"
        data-node-id={target.id}
        className="pointer-events-none absolute top-0 left-0 ring-2 ring-gc-accent"
        style={{
          transform: `translate(${x - DROP_RING_GAP}px, ${y - DROP_RING_GAP}px)`,
          width: width + DROP_RING_GAP * 2,
          height: height + DROP_RING_GAP * 2,
          borderRadius: `calc(var(--gc-radius) + ${DROP_RING_GAP}px)`,
        }}
      />
    </ViewportPortal>
  )
}

function dropTargetSelector(state: ReactFlowState) {
  const { connection } = state
  if (!connection.inProgress) return null
  return findDrop(state, connection.pointer, connection.fromHandle)?.nodeId ?? null
}

/** `pointer` is relative to the flow container, as React Flow reports it. */
function findDrop(state: ReactFlowState, pointer: XYPosition, fromHandle: Handle) {
  const [tx, ty, zoom] = state.transform
  const point = { x: (pointer.x - tx) / zoom, y: (pointer.y - ty) / zoom }
  const node = topNodeAt(state, point, fromHandle.nodeId)
  if (!node) return null

  const type: HandleType = fromHandle.type === "source" ? "target" : "source"
  const fromId = fromHandle.id ?? null
  for (const handle of node.internals.handleBounds?.[type] ?? []) {
    const handleId = handle.id ?? null
    const connection: Connection =
      type === "target"
        ? {
            source: fromHandle.nodeId,
            sourceHandle: fromId,
            target: node.id,
            targetHandle: handleId,
          }
        : {
            source: node.id,
            sourceHandle: handleId,
            target: fromHandle.nodeId,
            targetHandle: fromId,
          }

    if (isHandleTaken(state, node.id, type, handleId)) continue
    if (!acceptsConnection(state, node.id, type, handleId)) continue
    if (state.isValidConnection && !state.isValidConnection(connection)) continue
    return { nodeId: node.id, connection }
  }
  return null
}

function topNodeAt(state: ReactFlowState, point: XYPosition, excludeId: string) {
  let top: InternalNode | null = null
  for (const node of state.nodeLookup.values()) {
    if (node.id === excludeId || node.hidden) continue
    const { x, y } = node.internals.positionAbsolute
    const { width = 0, height = 0 } = node.measured
    const inside = point.x >= x && point.x <= x + width && point.y >= y && point.y <= y + height
    if (inside && (!top || node.internals.z >= top.internals.z)) top = node
  }
  return top
}

function isHandleTaken(
  state: ReactFlowState,
  nodeId: string,
  type: HandleType,
  handleId: string | null,
) {
  const connections = state.connectionLookup.get(`${nodeId}-${type}`)?.values() ?? []
  for (const connection of connections) {
    const end = type === "target" ? connection.targetHandle : connection.sourceHandle
    if ((end ?? null) === handleId) return true
  }
  return false
}

// React Flow keeps whether a port accepts connections only on its DOM node, as classes.
function acceptsConnection(
  state: ReactFlowState,
  nodeId: string,
  type: HandleType,
  handleId: string | null,
) {
  const port = state.domNode?.querySelector(
    `.react-flow__handle[data-id="${state.rfId}-${nodeId}-${handleId}-${type}"]`,
  )
  return !!port?.classList.contains("connectable") && port.classList.contains("connectableend")
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
