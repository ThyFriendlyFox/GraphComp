import { render } from "@testing-library/react"
import type { ReactNode } from "react"
import { Position } from "@xyflow/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { NodePort } from "@/registry/graphcomp/ui/node-port"

const updateNodeInternals = vi.fn()

vi.mock("@xyflow/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@xyflow/react")>()

  return {
    ...actual,
    Handle: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    useNodeId: () => "node-1",
    useUpdateNodeInternals: () => updateNodeInternals,
  }
})

describe("NodePort", () => {
  beforeEach(() => {
    updateNodeInternals.mockClear()
  })

  it("updates React Flow when a port mounts, changes, and unmounts", () => {
    const { rerender, unmount } = render(
      <NodePort id="first" type="target" position={Position.Left} align="center" />,
    )

    expect(updateNodeInternals).toHaveBeenCalledWith("node-1")

    rerender(<NodePort id="first" type="target" position={Position.Left} align="header" />)
    expect(updateNodeInternals).toHaveBeenCalledTimes(3)
    expect(updateNodeInternals).toHaveBeenNthCalledWith(2, "node-1")
    expect(updateNodeInternals).toHaveBeenNthCalledWith(3, "node-1")

    rerender(<NodePort id="first" type="target" position={Position.Right} align="header" />)
    expect(updateNodeInternals).toHaveBeenCalledTimes(5)
    expect(updateNodeInternals).toHaveBeenNthCalledWith(4, "node-1")
    expect(updateNodeInternals).toHaveBeenNthCalledWith(5, "node-1")

    rerender(<NodePort id="renamed" type="target" position={Position.Right} align="header" />)
    expect(updateNodeInternals).toHaveBeenCalledTimes(7)
    expect(updateNodeInternals).toHaveBeenNthCalledWith(6, "node-1")
    expect(updateNodeInternals).toHaveBeenNthCalledWith(7, "node-1")

    unmount()
    expect(updateNodeInternals).toHaveBeenCalledTimes(8)
    expect(updateNodeInternals).toHaveBeenLastCalledWith("node-1")
  })
})
