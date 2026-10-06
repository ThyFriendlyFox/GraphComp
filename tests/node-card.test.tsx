import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import {
  NodeBody,
  NodeCard,
  NodeCollapseTrigger,
  NodeGrip,
  NodeHeader,
  NodeStatus,
  NodeTitle,
} from "@/registry/graphcomp/ui/node-card"

function Card(props: { defaultOpen?: boolean }) {
  return (
    <NodeCard {...props}>
      <NodeHeader>
        <NodeTitle eyebrow="Script">On Mouse Down</NodeTitle>
        <NodeCollapseTrigger />
      </NodeHeader>
      <NodeBody>Body content</NodeBody>
      <NodeGrip />
    </NodeCard>
  )
}

describe("NodeCard", () => {
  it("opens and closes the body from the header trigger", async () => {
    const user = userEvent.setup()
    render(<Card defaultOpen={false} />)

    expect(screen.queryByText("Body content")).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Expand" }))
    expect(screen.getByText("Body content")).toBeInTheDocument()
    expect(screen.getAllByRole("button", { name: "Collapse" })[0]).toHaveAttribute(
      "aria-expanded",
      "true",
    )
  })

  it("renders the grip only while open, and the grip collapses the node", async () => {
    const user = userEvent.setup()
    const { container } = render(<Card />)

    const grip = container.querySelector('[data-slot="node-grip"]')
    expect(grip).not.toBeNull()
    await user.click(grip as HTMLElement)
    expect(container.querySelector('[data-slot="node-card"]')).toHaveAttribute(
      "data-state",
      "closed",
    )
    expect(container.querySelector('[data-slot="node-grip"]')).toBeNull()
  })

  it("throws a clear error when a part renders outside NodeCard", () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    expect(() => render(<NodeGrip />)).toThrow("NodeCard parts must be rendered inside <NodeCard>.")
  })
})

describe("NodeStatus", () => {
  it.each([
    ["idle", "Idle", null],
    ["running", "Running", null],
    ["done", "Done", "lucide-check"],
    ["error", "Error", "lucide-x"],
  ] as const)("names the %s state and draws its own shape", (state, name, glyph) => {
    const { container } = render(<NodeStatus state={state} />)

    const status = screen.getByRole("img", { name })
    expect(status).toHaveAttribute("data-run-state", state)
    expect(status).not.toHaveAttribute("data-active")
    const mark = container.querySelector('[data-slot="node-status-mark"] svg')
    if (glyph) expect(mark).toHaveClass(glyph)
    else expect(mark).toBeNull()
  })

  it("keeps `active` as it was when no state is set", () => {
    const { container, rerender } = render(<NodeStatus />)
    const status = container.querySelector('[data-slot="node-status"]')

    expect(status).toHaveAttribute("data-active", "true")
    expect(status).not.toHaveAttribute("role")
    expect(status).not.toHaveAttribute("data-run-state")
    rerender(<NodeStatus active={false} />)
    expect(status).not.toHaveAttribute("data-active")
    expect(container.querySelector('[data-slot="node-status-mark"]')).toBeNull()
  })

  it("lets `state` win over `active`", () => {
    render(<NodeStatus active state="error" />)
    expect(screen.getByRole("img", { name: "Error" })).not.toHaveAttribute("data-active")
  })

  it("takes a custom accessible name", () => {
    render(<NodeStatus state="running" aria-label="Running step 2" />)
    expect(screen.getByRole("img", { name: "Running step 2" })).toBeInTheDocument()
  })
})

describe("NodeCard run state", () => {
  it("sets data-run-state for the border to follow, apart from data-state", () => {
    const { container, rerender } = render(<NodeCard runState="error" />)
    const card = container.querySelector('[data-slot="node-card"]')

    expect(card).toHaveAttribute("data-run-state", "error")
    expect(card).toHaveAttribute("data-state", "open")
    rerender(<NodeCard />)
    expect(card).not.toHaveAttribute("data-run-state")
  })
})
