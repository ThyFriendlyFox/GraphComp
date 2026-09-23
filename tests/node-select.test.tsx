import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { NodeSelect } from "@/registry/graphcomp/ui/node-select"

const options = [
  { value: "push", label: "Push Action" },
  { value: "hold", label: "Hold", disabled: true },
  { value: "open", label: "Open Node" },
]

function setup(props: Partial<Parameters<typeof NodeSelect>[0]> = {}) {
  const onValueChange = vi.fn()
  render(
    <NodeSelect
      aria-label="Trigger"
      placeholder="Select Trigger"
      options={options}
      onValueChange={onValueChange}
      {...props}
    />,
  )
  return { onValueChange, user: userEvent.setup() }
}

describe("NodeSelect", () => {
  it("shows the placeholder when nothing is selected", () => {
    setup()
    expect(screen.getByRole("combobox", { name: "Trigger" })).toHaveTextContent("Select Trigger")
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
  })

  it("opens from the keyboard, skips disabled options and selects with Enter", async () => {
    const { user, onValueChange } = setup()
    screen.getByRole("combobox").focus()
    await user.keyboard("{ArrowDown}")

    const listbox = screen.getByRole("listbox")
    expect(listbox).toHaveFocus()
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-expanded", "true")

    await user.keyboard("{ArrowDown}{Enter}")
    expect(onValueChange).toHaveBeenCalledWith("open")
    expect(screen.getByRole("option", { name: "Open Node" })).toHaveAttribute("data-confirming")

    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument())
    expect(screen.getByRole("combobox")).toHaveTextContent("Open Node")
    expect(screen.getByRole("combobox")).toHaveFocus()
  })

  it("closes on Escape without changing the value", async () => {
    const { user, onValueChange } = setup({ defaultValue: "push" })
    await user.click(screen.getByRole("combobox"))
    await user.keyboard("{Escape}")
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-expanded", "false")
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it("selects an option on click", async () => {
    const { user, onValueChange } = setup()
    await user.click(screen.getByRole("combobox"))
    await user.click(screen.getByRole("option", { name: "Push Action" }))
    expect(onValueChange).toHaveBeenCalledWith("push")
  })
})
