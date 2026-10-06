import { render } from "@testing-library/react"
import type { ReactNode, Ref } from "react"
import { Position } from "@xyflow/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { NodePort } from "@/registry/graphcomp/ui/node-port"

const updateNodeInternals = vi.fn()
const nodeLookup = new Map<string, { internals: { handleBounds?: object } }>()
let nodeId = "node-1"
let frames: FrameRequestCallback[] = []

/** Runs the queued animation frames, as the browser does after a commit. */
function flushFrames() {
  const queued = frames
  frames = []
  for (const callback of queued) callback(0)
}

vi.mock("@xyflow/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@xyflow/react")>()

  return {
    ...actual,
    Handle: ({ children, ref }: { children?: ReactNode; ref?: Ref<HTMLDivElement> }) => (
      <div ref={ref}>{children}</div>
    ),
    useNodeId: () => nodeId,
    useStoreApi: () => ({ getState: () => ({ nodeLookup, updateNodeInternals }) }),
  }
})

/** Renders the port inside a React Flow node element, as React Flow does. */
function inNode(port: ReactNode) {
  return <div className="react-flow__node">{port}</div>
}

describe("NodePort", () => {
  beforeEach(() => {
    updateNodeInternals.mockClear()
    nodeLookup.clear()
    nodeId = "node-1"
    frames = []
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      frames.push(callback)
      return frames.length
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("leaves a node React Flow has not measured yet to its own first measurement", () => {
    render(inNode(<NodePort id="first" type="target" position={Position.Left} />))
    flushFrames()

    expect(updateNodeInternals).not.toHaveBeenCalled()
  })

  it("re-measures a measured node when a port mounts, changes and unmounts", () => {
    nodeLookup.set("node-1", { internals: { handleBounds: {} } })
    const updatedIds = () => updateNodeInternals.mock.calls.map(([updates]) => [...updates.keys()])

    const { rerender, unmount } = render(
      inNode(<NodePort id="first" type="target" position={Position.Left} align="center" />),
    )
    flushFrames()
    expect(updatedIds()).toEqual([["node-1"]])

    rerender(inNode(<NodePort id="first" type="target" position={Position.Left} align="header" />))
    rerender(inNode(<NodePort id="first" type="target" position={Position.Right} align="header" />))
    rerender(
      inNode(<NodePort id="renamed" type="target" position={Position.Right} align="header" />),
    )
    flushFrames()
    // Each change refreshes on the old port's cleanup and on the new port's mount.
    expect(updatedIds()).toHaveLength(7)

    updateNodeInternals.mockClear()
    unmount()
    flushFrames()
    // The node element left the page with the port, so nothing is measured.
    expect(updateNodeInternals).not.toHaveBeenCalled()
  })

  it("re-measures a node whose id has a quote", () => {
    nodeId = 'say "hi"'
    nodeLookup.set(nodeId, { internals: { handleBounds: {} } })

    render(inNode(<NodePort id="in" type="target" position={Position.Left} />))
    flushFrames()

    const [updates] = updateNodeInternals.mock.calls[0]
    expect([...updates.keys()]).toEqual(['say "hi"'])
    expect(updates.get('say "hi"').nodeElement).toHaveClass("react-flow__node")
  })
})
