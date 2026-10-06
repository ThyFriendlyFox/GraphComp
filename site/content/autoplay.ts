import {
  card,
  field,
  header,
  label,
  node,
  option,
  port,
  radio,
  select,
  type Step,
} from "../lib/autoplay"

// Each script leaves its demo as it found it, so the loop can repeat.

const pick = (scope: string, combobox: string, choice: string, back: string): Step[] => [
  { click: card(scope, label(combobox)) },
  { wait: 300 },
  { click: card(scope, option(choice)) },
  { wait: 700 },
  { click: card(scope, label(combobox)) },
  { wait: 300 },
  { click: card(scope, option(back)) },
]

const step = (scope: string, name: string, button: string, times: number): Step[] =>
  Array.from({ length: times }, () => ({ click: card(scope, field(name, label(button))) }))

export const eventFlowScript: Step[] = [
  { click: card("On Mouse Down", label("Expand")) },
  { wait: 500 },
  { click: card("On Mouse Down", radio("Record")) },
  { wait: 400 },
  { click: card("On Mouse Down", radio("Trigger")) },
  ...step("On Mouse Down", "Sensitivity", "Increase", 3),
  ...pick("On Mouse Down", "Trigger", "Open Node", "Push Action"),
  ...step("On Mouse Down", "Sensitivity", "Decrease", 3),
  { click: card("On Mouse Down", label("Collapse")) },
  { wait: 400 },
  { drag: header("Add Item"), by: [60, 40] },
  { wait: 400 },
  { drag: header("Add Item"), by: [-60, -40] },
  { click: card("Amend Inventory", label("Collapse")) },
  { wait: 600 },
  { click: card("Amend Inventory", label("Expand")) },
]

export const autoplayScripts: Record<string, Step[]> = {
  "flow-canvas": [
    { click: label("Zoom in") },
    { wait: 500 },
    { drag: node("b"), by: [-40, 70] },
    { wait: 300 },
    { drag: node("b"), by: [40, -70] },
    { click: label("Zoom out") },
  ],
  "flow-edge": [
    { drag: header("Parse"), by: [0, 110] },
    { wait: 300 },
    { drag: header("Parse"), by: [0, -110] },
    { drag: header("Store"), by: [70, 60] },
    { wait: 300 },
    { drag: header("Store"), by: [-70, -60] },
  ],
  "node-port": [
    { connect: [port("a", "out"), port("b", "in")] },
    { wait: 500 },
    { drag: header("Drop on a port"), by: [-40, 60] },
    { wait: 300 },
    { drag: header("Drop on a port"), by: [40, -60] },
    { wait: 600 },
    { click: select(".react-flow__edge") },
    { key: "Backspace" },
  ],
  "node-card": [
    { click: label("Collapse") },
    { wait: 600 },
    { click: label("Expand") },
    { wait: 400 },
    ...step("Delay", "Wait", "Increase", 3),
    ...step("Delay", "Wait", "Decrease", 3),
    { click: select('[data-slot="node-grip"]') },
    { wait: 600 },
    { click: label("Expand") },
  ],
  "node-pressable": [
    { click: label("Play") },
    { wait: 1200 },
    { click: label("Pause") },
    { click: label("Play") },
    { wait: 900 },
    { click: label("Reset") },
  ],
  "node-segmented": [
    { click: radio("Record") },
    { wait: 500 },
    { click: radio("Loop") },
    { wait: 500 },
    { click: radio("Trigger") },
  ],
  "node-select": pick("Open Inventory", "Trigger", "Open Node", "Push Action"),
  "node-stepper": [
    ...step("On Key Press", "Sensitivity", "Increase", 4),
    ...step("On Key Press", "Delay", "Increase", 3),
    ...step("On Key Press", "Sensitivity", "Decrease", 4),
    ...step("On Key Press", "Delay", "Decrease", 3),
  ],
  "node-input": [
    { type: label("Label"), text: "Billing" },
    { wait: 400 },
    { type: label("Queue"), text: "Tier 2" },
    { wait: 900 },
    { type: label("Label"), text: "Support" },
    { type: label("Queue"), text: "Tier 1" },
  ],
  "node-textarea": [
    {
      type: label("Instruction"),
      text: "Summarize the ticket in 3 bullet points. Name the customer and the product, then list the next steps.",
    },
    { wait: 1200 },
    { type: label("Instruction"), text: "Summarize the ticket." },
  ],
  "event-flow": eventFlowScript,
}
