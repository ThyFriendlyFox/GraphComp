import { useState } from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { NodeInput } from "@/registry/graphcomp/ui/node-input"

describe("NodeInput", () => {
  it("is reached with Tab and keeps its own text when uncontrolled", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<NodeInput aria-label="Tag" defaultValue="Loot" onValueChange={onValueChange} />)

    const input = screen.getByRole("textbox", { name: "Tag" })
    await user.tab()
    expect(input).toHaveFocus()
    await user.keyboard("{End}{Backspace}{Backspace}{Backspace}{Backspace}Gold")
    expect(input).toHaveValue("Gold")
    expect(onValueChange).toHaveBeenLastCalledWith("Gold")
  })

  it("shows the value it is given when controlled", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const { rerender } = render(
      <NodeInput aria-label="Tag" value="Loot" onValueChange={onValueChange} />,
    )

    const input = screen.getByRole("textbox", { name: "Tag" })
    await user.type(input, "s")
    expect(onValueChange).toHaveBeenLastCalledWith("Loots")
    expect(input).toHaveValue("Loot")

    rerender(<NodeInput aria-label="Tag" value="Quest" onValueChange={onValueChange} />)
    expect(input).toHaveValue("Quest")
  })

  it("follows a parent that stores the text", async () => {
    const user = userEvent.setup()
    function Parent() {
      const [text, setText] = useState("")
      return (
        <>
          <NodeInput aria-label="Name" value={text} onValueChange={setText} />
          <output>{text}</output>
        </>
      )
    }
    render(<Parent />)
    await user.type(screen.getByRole("textbox", { name: "Name" }), "Ask")
    expect(screen.getByRole("status")).toHaveTextContent("Ask")
  })

  it("opts out of canvas drag, wheel and keys", () => {
    render(<NodeInput aria-label="Tag" />)
    expect(screen.getByRole("textbox")).toHaveClass("nodrag", "nowheel", "nokey")
  })
})
