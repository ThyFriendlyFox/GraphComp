import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { NodeSegmented } from "@/registry/graphcomp/ui/node-segmented"

const options = [
  { value: "trigger", label: "Trigger" },
  { value: "record", label: "Record" },
  { value: "replay", label: "Replay", disabled: true },
]

describe("NodeSegmented", () => {
  it("checks the default option and moves with arrow keys, skipping disabled options", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<NodeSegmented aria-label="Mode" options={options} onValueChange={onValueChange} />)

    const trigger = screen.getByRole("radio", { name: "Trigger" })
    expect(trigger).toHaveAttribute("aria-checked", "true")
    expect(screen.getByRole("radiogroup", { name: "Mode" })).toBeInTheDocument()

    await user.click(trigger)
    await user.keyboard("{ArrowRight}")
    expect(screen.getByRole("radio", { name: "Record" })).toHaveAttribute("aria-checked", "true")
    expect(screen.getByRole("radio", { name: "Record" })).toHaveFocus()

    await user.keyboard("{ArrowRight}")
    expect(trigger).toHaveAttribute("aria-checked", "true")
    expect(onValueChange).toHaveBeenLastCalledWith("trigger")
  })

  it("keeps a roving tab index on the checked option only", () => {
    render(<NodeSegmented aria-label="Mode" options={options} defaultValue="record" />)
    expect(screen.getByRole("radio", { name: "Record" })).toHaveAttribute("tabindex", "0")
    expect(screen.getByRole("radio", { name: "Trigger" })).toHaveAttribute("tabindex", "-1")
  })
})
