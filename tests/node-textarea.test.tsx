import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { NodeTextarea } from "@/registry/graphcomp/ui/node-textarea"

const LINE = 16
const PADDING = 8
// jsdom applies no Tailwind and does no layout. Inline metrics and a
// scrollHeight of one line per text line stand in for the browser.
const metrics = {
  lineHeight: `${LINE}px`,
  paddingTop: `${PADDING}px`,
  paddingBottom: `${PADDING}px`,
}
const rows = (count: number) => `${count * LINE + 2 * PADDING}px`

beforeAll(() => {
  Object.defineProperty(HTMLTextAreaElement.prototype, "scrollHeight", {
    configurable: true,
    get(this: HTMLTextAreaElement) {
      return this.value.split("\n").length * LINE + 2 * PADDING
    },
  })
})

afterAll(() => {
  delete (HTMLTextAreaElement.prototype as { scrollHeight?: number }).scrollHeight
})

describe("NodeTextarea", () => {
  it("is reached with Tab and keeps its own text when uncontrolled", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<NodeTextarea aria-label="Instruction" onValueChange={onValueChange} />)

    const textarea = screen.getByRole("textbox", { name: "Instruction" })
    await user.tab()
    expect(textarea).toHaveFocus()
    await user.keyboard("Ask{Enter}twice")
    expect(textarea).toHaveValue("Ask\ntwice")
    expect(onValueChange).toHaveBeenLastCalledWith("Ask\ntwice")
  })

  it("shows the value it is given when controlled", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const { rerender } = render(
      <NodeTextarea aria-label="Instruction" value="Hi" onValueChange={onValueChange} />,
    )

    const textarea = screen.getByRole("textbox", { name: "Instruction" })
    await user.type(textarea, "!")
    expect(onValueChange).toHaveBeenLastCalledWith("Hi!")
    expect(textarea).toHaveValue("Hi")

    rerender(<NodeTextarea aria-label="Instruction" value="Bye" onValueChange={onValueChange} />)
    expect(textarea).toHaveValue("Bye")
  })

  it("starts at minRows, grows with its text and scrolls after maxRows", async () => {
    const user = userEvent.setup()
    render(<NodeTextarea aria-label="Instruction" maxRows={4} style={metrics} />)

    const textarea = screen.getByRole("textbox")
    expect(textarea.style.height).toBe(rows(2))
    expect(textarea.style.overflowY).toBe("hidden")

    await user.type(textarea, "1{Enter}2{Enter}3")
    await waitFor(() => expect(textarea.style.height).toBe(rows(3)))

    await user.type(textarea, "{Enter}4{Enter}5{Enter}6")
    await waitFor(() => expect(textarea.style.height).toBe(rows(4)))
    expect(textarea.style.overflowY).toBe("auto")
  })

  it("opts out of canvas drag, wheel and keys", () => {
    render(<NodeTextarea aria-label="Instruction" />)
    expect(screen.getByRole("textbox")).toHaveClass("nodrag", "nowheel", "nokey")
  })
})
