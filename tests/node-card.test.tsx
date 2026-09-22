import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import {
  NodeBody,
  NodeCard,
  NodeCollapseTrigger,
  NodeGrip,
  NodeHeader,
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
