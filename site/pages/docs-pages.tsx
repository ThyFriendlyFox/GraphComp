import { CodeBlock } from "../components/code-block"
import { Command } from "../components/command"
import { Code, H1, H2, Lead, List, P, Steps, Table, TextLink } from "../components/prose"
import { installUrl, registryItem } from "../lib/registry"
import { useTitle } from "../lib/router"
import { DocsPager } from "./docs-layout"

export function IntroductionPage() {
  useTitle("Introduction")
  return (
    <article>
      <H1>Introduction</H1>
      <Lead className="mt-3">
        Nodes, edges, ports and in-node widgets for React Flow. You copy the source into your
        project and change it.
      </Lead>

      <P className="mt-8">
        React Flow gives you a fast canvas with pan, zoom, selection and edge routing. It does not
        give you the nodes. Every team builds the same headers, ports, collapsible bodies, selects
        and steppers again. GraphComp gives you these parts, ready to change.
      </P>

      <H2>Not a package</H2>
      <P>
        GraphComp is not a dependency. The shadcn CLI writes each component into your project as
        source. You own the code, so you can change any line.
      </P>

      <H2>Principles</H2>
      <List>
        <li>
          <strong>React Flow is the engine.</strong> GraphComp styles and extends{" "}
          <Code>@xyflow/react</Code>. It never replaces pan, zoom, selection or routing.
        </li>
        <li>
          <strong>Tokens, not colors.</strong> Every color comes from a <Code>--gc-*</Code> CSS
          variable. Change one variable to re-theme every canvas.
        </li>
        <li>
          <strong>Every press answers.</strong> Buttons shrink on a spring, values roll, and a
          select confirms the choice before it closes. Motion follows the reduced motion setting.
        </li>
        <li>
          <strong>Keyboard first.</strong> Every widget has a WAI-ARIA role, full keyboard support
          and a visible focus ring.
        </li>
        <li>
          <strong>Widgets stay in the canvas.</strong> Lists open inside the node, so they pan and
          zoom with it.
        </li>
      </List>

      <H2>Next</H2>
      <P>
        Read <TextLink to="/docs/installation">Installation</TextLink>, then open a component such
        as <TextLink to="/docs/components/node-card">Node Card</TextLink>.
      </P>

      <DocsPager />
    </article>
  )
}

export function InstallationPage() {
  useTitle("Installation")
  return (
    <article>
      <H1>Installation</H1>
      <Lead className="mt-3">
        Add GraphComp to a React project with Tailwind CSS 4 and the shadcn CLI.
      </Lead>

      <Steps className="mt-10">
        <li>
          <P className="font-medium">Set up shadcn/ui.</P>
          <P className="mt-1 text-gc-muted">
            Follow the{" "}
            <TextLink to="https://ui.shadcn.com/docs/installation">shadcn/ui installation</TextLink>{" "}
            for your framework. It creates <Code>components.json</Code> and the <Code>cn()</Code>{" "}
            helper.
          </P>
        </li>
        <li>
          <P className="font-medium">Add the theme.</P>
          <Command run={`shadcn@latest add ${installUrl("graphcomp-theme")}`} className="mt-3" />
        </li>
        <li>
          <P className="font-medium">Import the theme in your global CSS.</P>
          <P className="mt-1 text-gc-muted">
            Import it after Tailwind and the React Flow base styles.
          </P>
          <CodeBlock
            lang="css"
            title="app.css"
            className="mt-3"
            code={`@import "tailwindcss";
@import "@xyflow/react/dist/base.css";
@import "./styles/graphcomp.css";`}
          />
        </li>
        <li>
          <P className="font-medium">Add a component.</P>
          <Command run={`shadcn@latest add ${installUrl("node-card")}`} className="mt-3" />
        </li>
        <li>
          <P className="font-medium">Use it in a custom node.</P>
          <CodeBlock
            title="delay-node.tsx"
            className="mt-3"
            code={`import { Position, type NodeProps } from "@xyflow/react"
import {
  NodeBody,
  NodeCard,
  NodeCollapseTrigger,
  NodeField,
  NodeGrip,
  NodeHeader,
  NodeStatus,
  NodeTitle,
} from "@/components/ui/node-card"
import { NodePort } from "@/components/ui/node-port"
import { NodeStepper } from "@/components/ui/node-stepper"

export function DelayNode({ selected }: NodeProps) {
  return (
    <NodeCard selected={selected} className="w-56">
      <NodePort type="target" position={Position.Left} align="header" />
      <NodePort type="source" position={Position.Right} align="header" />
      <NodeHeader>
        <NodeStatus />
        <NodeTitle eyebrow="Timing">Delay</NodeTitle>
        <NodeCollapseTrigger />
      </NodeHeader>
      <NodeBody>
        <NodeField label="Wait">
          <NodeStepper aria-label="Wait" variant="spin" defaultValue={2} />
        </NodeField>
      </NodeBody>
      <NodeGrip />
    </NodeCard>
  )
}`}
          />
          <P className="text-gc-muted">
            Pass it to <Code>FlowCanvas</Code> in <Code>nodeTypes</Code>, like any React Flow custom
            node.
          </P>
        </li>
      </Steps>

      <H2>Dark mode</H2>
      <P>
        Add the <Code>dark</Code> class to <Code>{"<html>"}</Code> or to any parent of the canvas.
        Light and dark define the same tokens.
      </P>

      <H2>Requirements</H2>
      <Table
        head={["Package", "Version"]}
        rows={[
          [<Code>react</Code>, "19"],
          [<Code>tailwindcss</Code>, "4"],
          [<Code>@xyflow/react</Code>, "12"],
          [<Code>motion</Code>, "12 or later"],
        ]}
      />

      <DocsPager />
    </article>
  )
}

const tokens: [string, string][] = [
  ["--gc-canvas", "Canvas background"],
  ["--gc-grid", "Grid lines"],
  ["--gc-node", "Node body"],
  ["--gc-node-header", "Node header"],
  ["--gc-node-border", "Node border"],
  ["--gc-inset", "Widget well"],
  ["--gc-panel", "Panel inside a body"],
  ["--gc-control", "Widget controls"],
  ["--gc-fg", "Text"],
  ["--gc-muted", "Muted text and icons"],
  ["--gc-accent", "Ports, selection, active state"],
  ["--gc-accent-strong", "Open select list"],
  ["--gc-accent-fg", "Text on the accent"],
  ["--gc-edge", "Edges"],
  ["--gc-ring", "Focus ring"],
  ["--gc-shadow", "Node shadow"],
  ["--gc-radius", "Corner radius"],
]

export function ThemingPage() {
  useTitle("Theming")
  return (
    <article>
      <H1>Theming</H1>
      <Lead className="mt-3">
        Every color is a <Code>--gc-*</Code> CSS variable. Set a variable on any element to change
        everything inside it.
      </Lead>

      <H2>Tokens</H2>
      <P>
        The tokens live in <Code>styles/graphcomp.css</Code>. Light values are on <Code>:root</Code>
        ; dark values are on <Code>.dark</Code>. The <Code>gc-</Code> prefix keeps them apart from
        shadcn/ui tokens.
      </P>
      <Table
        head={["Token", "Use", "Light", "Dark"]}
        rows={tokens.map(([token, use]) => [
          <Code>{token}</Code>,
          use,
          <Swatch value={light[token]} />,
          <Swatch value={dark[token]} />,
        ])}
      />

      <H2>Scope a theme</H2>
      <P>
        Tokens are CSS variables, so they cascade. Set <Code>--gc-accent</Code> on one node, and its
        ports, pills, selects and focus rings follow.
      </P>
      <CodeBlock
        className="mt-4"
        code={`<NodeCard style={{ "--gc-accent": "#e5484d" } as React.CSSProperties}>
  ...
</NodeCard>`}
      />
      <P>Set the same variable on the canvas wrapper to change every node at once.</P>

      <DocsPager />
    </article>
  )
}

function tokenValues(block: string) {
  const css = registryItem("graphcomp-theme").files[0].source
  const body = css.slice(css.indexOf(`${block} {`)).split("}")[0]
  return Object.fromEntries(
    [...body.matchAll(/(--gc-[\w-]+):\s*([^;]+);/g)].map((match) => [match[1], match[2]]),
  )
}

const light = tokenValues(":root")
const dark = tokenValues(".dark")

function Swatch({ value }: { value?: string }) {
  if (!value?.startsWith("#")) return <span className="text-gc-muted">–</span>
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[12px] whitespace-nowrap text-gc-muted">
      <span
        className="inline-block size-4 rounded-[3px] border border-gc-node-border"
        style={{ background: value }}
      />
      {value}
    </span>
  )
}

export function NotFoundPage() {
  useTitle("Not found")
  return (
    <article>
      <H1>Page not found</H1>
      <P className="mt-4">
        No page has this address. Go to the <TextLink to="/docs">docs</TextLink>.
      </P>
    </article>
  )
}
