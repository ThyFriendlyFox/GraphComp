import { ArrowRight, Code2, Keyboard, Move, Palette, Spline, SquareStack } from "lucide-react"

import { cn } from "@/lib/utils"
import { Command } from "../components/command"
import { CanvasFrame } from "../components/preview"
import { SiteFooter } from "../components/site-footer"
import { SiteHeader } from "../components/site-header"
import { componentDocs } from "../content/docs"
import EventFlowDemo from "../demos/event-flow-demo"
import { installUrl, registryItem } from "../lib/registry"
import { Link } from "../lib/router"

const features = [
  {
    icon: Code2,
    title: "You own the code",
    text: "The shadcn CLI writes each component into your project. There is no package to update and no API to wait for.",
  },
  {
    icon: Spline,
    title: "Built on React Flow",
    text: "GraphComp styles and extends React Flow 12. Pan, zoom, selection and edge routing stay as they are.",
  },
  {
    icon: Move,
    title: "Motion that explains",
    text: "Bodies open on a spring and push the node below. Values roll. Every motion is under 500 ms and follows reduced motion.",
  },
  {
    icon: Keyboard,
    title: "Keyboard first",
    text: "Every widget has a WAI-ARIA role, arrow key support and a focus ring. Widget keys never move or delete the node.",
  },
  {
    icon: Palette,
    title: "Themed by tokens",
    text: "Every color is a --gc-* CSS variable, in light and dark. Re-theme the canvas, a group of nodes or one node.",
  },
  {
    icon: SquareStack,
    title: "Widgets stay in the node",
    text: "Select lists open inside the node, not in a portal, so they pan and zoom with the canvas.",
  },
]

const button =
  "inline-flex h-10 items-center gap-2 rounded-md px-4 text-[14px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-gc-ring focus-visible:ring-offset-2 focus-visible:ring-offset-gc-canvas focus-visible:outline-none [&_svg]:size-4"

export function HomePage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="site-grid relative overflow-hidden border-b border-gc-node-border/70">
          <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 pt-20 pb-14 text-center sm:px-6 sm:pt-28">
            <Link
              to="/docs/components/event-flow"
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-gc-node-border bg-gc-node/70 py-1 pr-3 pl-1.5 text-[12px] text-gc-fg/80 transition-colors hover:text-gc-fg focus-visible:ring-2 focus-visible:ring-gc-ring focus-visible:outline-none [&_svg]:size-3.5"
            >
              <span className="rounded-full bg-gc-accent px-2 py-0.5 text-[11px] font-medium text-gc-accent-fg">
                New
              </span>
              The Event Flow block
              <ArrowRight />
            </Link>
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
              Components for node canvases
            </h1>
            <p className="mt-5 max-w-2xl text-[17px] text-pretty text-gc-muted">
              Nodes, edges, ports and in-node widgets for React Flow. Styled with Tailwind CSS and
              animated with Motion. Copy the source into your app and change it.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/docs/installation"
                className={cn(button, "bg-gc-fg text-gc-canvas hover:bg-gc-fg/85")}
              >
                Get Started
              </Link>
              <Link
                to="/docs/components/node-card"
                className={cn(
                  button,
                  "border border-gc-node-border bg-gc-node/60 hover:bg-gc-control/50",
                )}
              >
                Browse Components
              </Link>
            </div>
            <Command
              run={`shadcn@latest add ${installUrl("event-flow")}`}
              className="mt-10 w-full max-w-2xl text-left"
            />
          </div>
          <div className="relative mx-auto max-w-6xl px-4 pb-16 sm:px-6">
            <div className="overflow-hidden rounded-xl border border-gc-node-border shadow-gc">
              <div className="flex h-9 items-center gap-1.5 border-b border-gc-node-border bg-gc-node-header px-3">
                <span className="size-2.5 rounded-full bg-gc-control" />
                <span className="size-2.5 rounded-full bg-gc-control" />
                <span className="size-2.5 rounded-full bg-gc-control" />
                <span className="ml-3 text-[12px] text-gc-muted">event-flow.tsx</span>
              </div>
              <CanvasFrame demo={EventFlowDemo} className="h-[460px] sm:h-[560px]" />
            </div>
            <p className="mt-3 text-center text-[13px] text-gc-muted">
              This canvas is live. Open a trigger, change a value, drag a node.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">The missing layer</h2>
          <p className="mt-3 max-w-2xl text-gc-muted">
            React Flow gives you the canvas. GraphComp gives you the nodes, with the polish of a
            product.
          </p>
          <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-gc-node-border bg-gc-node-border sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="bg-gc-canvas p-6">
                <feature.icon className="size-5 text-gc-accent" />
                <h3 className="mt-4 text-[15px] font-semibold">{feature.title}</h3>
                <p className="mt-2 text-[14px] leading-6 text-gc-muted">{feature.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-gc-node-border/70">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Components</h2>
                <p className="mt-3 text-gc-muted">
                  {componentDocs.length} items today. 97 in the catalog.
                </p>
              </div>
              <Link
                to="/docs/components/node-card"
                className="inline-flex items-center gap-1.5 rounded-gc text-[14px] font-medium text-gc-accent hover:underline focus-visible:ring-2 focus-visible:ring-gc-ring focus-visible:outline-none [&_svg]:size-4"
              >
                Open the docs
                <ArrowRight />
              </Link>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {componentDocs.map((doc) => {
                const item = registryItem(doc.name)
                return (
                  <Link
                    key={doc.name}
                    to={`/docs/components/${doc.name}`}
                    className="group flex flex-col rounded-xl border border-gc-node-border bg-gc-node/40 p-5 transition-colors hover:border-gc-accent/60 hover:bg-gc-node/70 focus-visible:ring-2 focus-visible:ring-gc-ring focus-visible:outline-none"
                  >
                    <span className="text-[11px] font-medium tracking-wide text-gc-muted uppercase">
                      {doc.group}
                    </span>
                    <span className="mt-2 flex items-center justify-between font-medium">
                      {item.title}
                      <ArrowRight className="size-4 text-gc-muted transition-transform group-hover:translate-x-0.5 group-hover:text-gc-accent" />
                    </span>
                    <span className="mt-1.5 text-[13px] leading-5 text-gc-muted">
                      {item.description}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
