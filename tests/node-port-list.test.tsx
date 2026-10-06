import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { CSSProperties, ReactNode } from "react"
import { Position } from "@xyflow/react"

import { NodeCard, NodeCollapseTrigger, NodeHeader } from "@/registry/graphcomp/ui/node-card"
import { NodePortList } from "@/registry/graphcomp/ui/node-port-list"

vi.mock("@xyflow/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@xyflow/react")>()

  return {
    ...actual,
    Handle: ({
      id,
      style,
      children,
    }: {
      id?: string
      style?: CSSProperties
      children?: ReactNode
    }) => (
      <div data-slot="handle" data-handleid={id} style={style}>
        {children}
      </div>
    ),
    useNodeId: () => "node-1",
    useUpdateNodeInternals: () => () => {},
  }
})

const answers = [
  { id: "yes", label: "Yes" },
  { id: "no", label: "No" },
  { id: "later", label: "Later", trailing: "2 days" },
]

function Decision(props: {
  open?: boolean
  defaultOpen?: boolean
  className?: string
  position?: Position.Left | Position.Right
}) {
  const { className, position, ...card } = props
  return (
    <NodeCard {...card}>
      <NodeHeader>
        <NodeCollapseTrigger />
      </NodeHeader>
      <NodePortList
        aria-label="Answers"
        type="source"
        position={position}
        ports={answers}
        className={className}
      />
    </NodeCard>
  )
}

const handles = () => [...document.querySelectorAll<HTMLElement>('[data-slot="handle"]')]
const rows = () => screen.queryAllByRole("listitem")

/** Every port id has exactly one handle. */
function expectOneHandlePerPort() {
  expect(handles().map((handle) => handle.dataset.handleid)).toEqual(["yes", "no", "later"])
}

function expectInRows() {
  expectOneHandlePerPort()
  for (const [index, row] of rows().entries()) {
    expect(row).toContainElement(handles()[index])
    expect(row).toHaveTextContent(answers[index].label)
  }
}

function expectAtHeader() {
  expectOneHandlePerPort()
  for (const handle of handles()) {
    expect(handle.closest('[role="listitem"]')).toBeNull()
    expect(handle.style.top).toBe("22px")
  }
}

describe("NodePortList", () => {
  it("puts each port in its row, on the card edge, whatever the list padding", () => {
    render(<Decision className="p-6" />)

    expect(screen.getByRole("list", { name: "Answers" })).toHaveClass("p-6")
    expect(rows()).toHaveLength(3)
    expectInRows()
    for (const [index, handle] of handles().entries()) {
      // The row is not a containing block, so `right` measures from the card edge
      // and the port keeps the row's vertical center (its static position).
      expect(rows()[index]).not.toHaveClass("relative")
      expect(handle.style.right).toBe("-14px")
      expect(handle.style.top).toBe("auto")
      expect(handle.style.transform).toBe("translateX(50%)")
    }
  })

  it("puts the label next to the port and the trailing content at the far end", () => {
    const { rerender } = render(<Decision />)
    const trailing = screen.getByText("2 days")
    expect(rows()[2]).toHaveClass("flex-row-reverse")
    expect(trailing).toHaveClass("mr-auto")

    rerender(<Decision position={Position.Left} />)
    expect(rows()[2]).not.toHaveClass("flex-row-reverse")
    expect(screen.getByText("2 days")).toHaveClass("ml-auto")
    expect(handles()[0].style.left).toBe("-14px")
    expect(handles()[0].style.transform).toBe("translateX(-50%)")
  })

  it("moves the ports to the header from the keyboard, with one handle per port at every step", async () => {
    const user = userEvent.setup()
    render(<Decision />)

    screen.getByRole("button", { name: "Collapse" }).focus()
    await user.keyboard("{Enter}")
    // The rows are still animating out, but their ports are already at the header.
    expectAtHeader()
    await waitFor(() => expect(rows()).toHaveLength(0))
    expectAtHeader()

    screen.getByRole("button", { name: "Expand" }).focus()
    await user.keyboard("{Enter}")
    expect(rows()).toHaveLength(3)
    expectInRows()
  })

  it("follows a controlled NodeCard and starts closed with the ports at the header", () => {
    const { rerender } = render(<Decision open={false} />)
    expect(rows()).toHaveLength(0)
    expectAtHeader()

    rerender(<Decision open />)
    expectInRows()
  })

  it("starts closed when the uncontrolled NodeCard starts closed", () => {
    render(<Decision defaultOpen={false} />)
    expect(screen.queryByRole("list")).not.toBeInTheDocument()
    expectAtHeader()
  })
})
