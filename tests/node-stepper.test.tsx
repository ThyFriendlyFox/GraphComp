import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { NodeStepper } from "@/registry/graphcomp/ui/node-stepper"

describe("NodeStepper", () => {
  it("steps with buttons and clamps to the range", async () => {
    const user = userEvent.setup()
    render(<NodeStepper aria-label="Sensitivity" defaultValue={99} format={(v) => `${v}%`} />)

    const spin = screen.getByRole("spinbutton", { name: "Sensitivity" })
    expect(spin).toHaveAttribute("aria-valuetext", "99%")

    await user.click(screen.getByRole("button", { name: "Increase" }))
    expect(spin).toHaveAttribute("aria-valuenow", "100")
    expect(screen.getByRole("button", { name: "Increase" })).toBeDisabled()
  })

  it("supports arrow, page, Home and End keys", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <NodeStepper aria-label="Delay" defaultValue={2} max={60} onValueChange={onValueChange} />,
    )

    screen.getByRole("spinbutton").focus()
    await user.keyboard("{ArrowUp}")
    expect(onValueChange).toHaveBeenLastCalledWith(3)
    await user.keyboard("{PageUp}")
    expect(onValueChange).toHaveBeenLastCalledWith(13)
    await user.keyboard("{End}")
    expect(onValueChange).toHaveBeenLastCalledWith(60)
    await user.keyboard("{Home}")
    expect(onValueChange).toHaveBeenLastCalledWith(0)
  })

  it("rounds fractional steps without float drift", async () => {
    const user = userEvent.setup()
    render(<NodeStepper aria-label="Gain" defaultValue={0.1} step={0.1} max={1} />)
    screen.getByRole("spinbutton").focus()
    await user.keyboard("{ArrowUp}{ArrowUp}")
    expect(screen.getByRole("spinbutton")).toHaveAttribute("aria-valuenow", "0.3")
  })
})
