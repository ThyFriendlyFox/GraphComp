import { CodeBlock } from "../components/code-block"
import { Command } from "../components/command"
import { Code, H1, H2, Lead, List, P, Steps, Table, TextLink } from "../components/prose"
import { installUrl, REGISTRY_URL, registryItem } from "../lib/registry"
import { DocsPager } from "./docs-layout"

export function IntroductionPage() {
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

const bundleUrl = REGISTRY_URL.replace(/\/r$/, "/wc/graphcomp.js")

export function WebComponentsPage() {
  return (
    <article>
      <H1>Use without React</H1>
      <Lead className="mt-3">
        Load one script and use the <Code>{"<gc-flow-canvas>"}</Code> element in any HTML page. The
        page needs no React and no build step.
      </Lead>

      <H2>Add the script</H2>
      <P>
        Add the script, then add the element with its nodes and edges as JSON. Give the element a
        height.
      </P>
      <CodeBlock
        lang="html"
        title="index.html"
        className="mt-4"
        code={`<script type="module" src="${bundleUrl}"></script>

<gc-flow-canvas style="height: 480px">
  <script type="application/json">
    {
      "nodes": [
        { "id": "a", "position": { "x": 0, "y": 0 }, "data": { "title": "Webhook" } },
        { "id": "b", "position": { "x": 320, "y": 0 }, "data": { "title": "Filter" } }
      ],
      "edges": [{ "id": "a-b", "source": "a", "target": "b" }]
    }
  </script>
</gc-flow-canvas>`}
      />
      <P>
        The script contains React, React Flow, Motion and the GraphComp styles: about 620 kB, or 190
        kB with gzip. Open the <TextLink to="/wc/example.html">example page</TextLink> and read its
        source.
      </P>
      <P>
        The file at this address changes with every release of the site. To keep one version,
        download the file and serve it from your own site.
      </P>

      <H2>Attributes</H2>
      <Table
        head={["Attribute", "Value", "Description"]}
        rows={[
          [<Code>nodes</Code>, "JSON array", "The nodes. A new value replaces the nodes."],
          [<Code>edges</Code>, "JSON array", "The edges. A new value replaces the edges."],
          [
            <Code>theme</Code>,
            <>
              <Code>light</Code>, <Code>dark</Code>
            </>,
            <>
              Sets the theme. Without it, the element is dark inside an element with the{" "}
              <Code>dark</Code> class.
            </>,
          ],
          [<Code>grid</Code>, <Code>false</Code>, "Hides the grid."],
        ]}
      />
      <P>
        A child <Code>{'<script type="application/json">'}</Code> with{" "}
        <Code>{"{ nodes, edges }"}</Code> sets the first nodes and edges when the <Code>nodes</Code>{" "}
        attribute is not set.
      </P>

      <H2>Properties</H2>
      <Table
        head={["Property", "Type", "Description"]}
        rows={[
          [<Code>nodes</Code>, <Code>Node[]</Code>, "The current nodes. Set it to replace them."],
          [<Code>edges</Code>, <Code>Edge[]</Code>, "The current edges. Set it to replace them."],
          [<Code>fitView()</Code>, "method", "Fits every node into the view."],
        ]}
      />
      <P>
        Nodes and edges use the React Flow format. The element fits the first nodes into the view.
        Call <Code>fitView()</Code> after you replace them.
      </P>

      <H2>Node types</H2>
      <Table
        head={["type", "Renders"]}
        rows={[
          [
            <>
              none, <Code>card</Code>
            </>,
            <>
              A node with a header. <Code>data</Code>: <Code>title</Code>, <Code>eyebrow</Code>,{" "}
              <Code>input</Code> and <Code>output</Code> (<Code>false</Code> hides that port).
            </>,
          ],
          [
            <>
              <Code>entry</Code>, <Code>trigger-stack</Code>, <Code>script</Code>, <Code>item</Code>
            </>,
            <>
              The nodes of the <TextLink to="/docs/components/event-flow">Event Flow</TextLink>{" "}
              block. <Code>script</Code> takes <Code>data.title</Code>.
            </>,
          ],
        ]}
      />
      <P>
        Every edge is a <TextLink to="/docs/components/flow-edge">Flow Edge</TextLink>. Set{" "}
        <Code>data.dot</Code> to <Code>false</Code> to hide its midpoint dot.
      </P>

      <H2>Events</H2>
      <P>
        Each event fires after the change. The <Code>nodes</Code> and <Code>edges</Code> properties
        already hold the new state. The events bubble out of the shadow root.
      </P>
      <Table
        head={["Event", "detail", "Fires when"]}
        rows={[
          [
            <Code>gc-nodes-change</Code>,
            <Code>{"{ changes, nodes }"}</Code>,
            "A node moves, changes size, or is selected or deleted.",
          ],
          [
            <Code>gc-edges-change</Code>,
            <Code>{"{ changes, edges }"}</Code>,
            "An edge is selected or deleted.",
          ],
          [
            <Code>gc-connect</Code>,
            <Code>{"{ connection, edges }"}</Code>,
            "The user drags a new edge from a port to a port.",
          ],
        ]}
      />
      <CodeBlock
        className="mt-4"
        code={`const canvas = document.querySelector("gc-flow-canvas")

canvas.addEventListener("gc-connect", (event) => {
  console.log(event.detail.connection.source, event.detail.connection.target)
})

canvas.nodes = [...canvas.nodes, { id: "c", position: { x: 0, y: 160 }, data: { title: "Log" } }]`}
      />

      <H2>Theming</H2>
      <P>
        The element renders into a shadow root. Page styles do not reach the nodes, and GraphComp
        styles do not reach the page. Set <Code>--gc-*</Code> tokens on the element itself. A token
        on the element applies in light and dark.
      </P>
      <CodeBlock
        lang="css"
        className="mt-4"
        code={`gc-flow-canvas {
  height: 480px;
  --gc-accent: #f97316;
}

/* Values for dark only */
gc-flow-canvas:state(dark) {
  --gc-canvas: #101012;
}`}
      />
      <P>
        Add the <Code>dark</Code> class to <Code>{"<html>"}</Code> or to any parent of the element
        to use the dark tokens. The <Code>theme</Code> attribute overrides the class. The element
        adds the Tailwind <Code>--tw-*</Code> property rules to the page, because browsers ignore
        them inside a shadow root.
      </P>

      <H2>Limits</H2>
      <List>
        <li>You cannot add a node type. A custom node is a React component.</li>
        <li>
          Widget values inside a node, such as a select in a <Code>script</Code> node, are not in{" "}
          <Code>data</Code> and fire no events.
        </li>
        <li>The element has no toolbar and no zoom control. The wheel zooms the canvas.</li>
        <li>GraphComp has no element for one widget alone.</li>
        <li>
          The script contains its own React. A React app uses the{" "}
          <TextLink to="/docs/installation">registry items</TextLink> instead.
        </li>
        <li>
          The element needs custom element states: Chrome 125, Firefox 126, Safari 17.4 or later.
        </li>
      </List>

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
  return (
    <article>
      <H1>Page not found</H1>
      <P className="mt-4">
        No page has this address. Go to the <TextLink to="/docs">docs</TextLink>.
      </P>
    </article>
  )
}
