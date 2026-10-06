// <gc-flow-canvas>: a custom element that mounts the GraphComp React
// components, for pages without React or a build step. The registry stays
// the source; nothing in `registry/` imports this folder.
import { createRoot, type Root } from "react-dom/client"
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type ReactFlowInstance,
} from "@xyflow/react"

import { Canvas, fitViewOptions } from "./canvas"
import css from "./graphcomp.css?inline"

/**
 * Adapts the compiled stylesheet to a shadow root:
 * - Light tokens on `:root` move to `:host`.
 * - Dark tokens on `.dark` move to `:host(:state(dark))`. On the host, a
 *   `--gc-*` value that the page sets on the element wins in both modes.
 * - Browsers ignore `@property` inside a shadow root, and Tailwind needs its
 *   `--tw-*` initial values, so those rules go to the document instead.
 */
function adapt(source: string) {
  const properties: string[] = []
  const shadow = source
    .replace(/@property\s+[\w-]+\s*\{[^}]*\}/g, (rule) => {
      properties.push(rule)
      return ""
    })
    .replace(/:root\b/g, ":host")
    .replace(/(^|[\s;{}])\.dark\s*\{/g, "$1:host(:state(dark)){")
  return { shadow, properties: properties.join("\n") }
}

let sheets: { shadow: CSSStyleSheet; properties: CSSStyleSheet } | undefined

function styleSheets() {
  if (!sheets) {
    const { shadow, properties } = adapt(css)
    sheets = { shadow: new CSSStyleSheet(), properties: new CSSStyleSheet() }
    sheets.shadow.replaceSync(shadow)
    sheets.properties.replaceSync(properties)
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheets.properties]
  }
  return sheets.shadow
}

// One observer for every element: a `.dark` class anywhere above an element
// switches it to dark, unless its `theme` attribute says otherwise.
const connected = new Set<GcFlowCanvas>()
let classObserver: MutationObserver | undefined

function watchClasses() {
  if (classObserver) return
  classObserver = new MutationObserver(() => connected.forEach((element) => element.syncTheme()))
  classObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
    subtree: true,
  })
}

function parseList<T>(value: string | null, name: string): T[] {
  if (value === null || value.trim() === "") return []
  const parsed: unknown = JSON.parse(value)
  if (!Array.isArray(parsed)) throw new TypeError(`gc-flow-canvas: "${name}" must be a JSON array.`)
  return parsed as T[]
}

export class GcFlowCanvas extends HTMLElement {
  static observedAttributes = ["nodes", "edges", "theme", "grid"]

  #nodes: Node[] = []
  #edges: Edge[] = []
  #root: Root | undefined
  #container: HTMLDivElement
  #instance: ReactFlowInstance | undefined
  #internals = this.attachInternals()

  constructor() {
    super()
    const shadow = this.attachShadow({ mode: "open" })
    shadow.adoptedStyleSheets = [styleSheets()]
    this.#container = document.createElement("div")
    this.#container.className = "gc-root"
    shadow.append(this.#container)
  }

  /** The current nodes. Setting replaces them. */
  get nodes(): Node[] {
    return this.#nodes
  }

  set nodes(value: Node[]) {
    this.#nodes = value
    this.#render()
  }

  /** The current edges. Setting replaces them. */
  get edges(): Edge[] {
    return this.#edges
  }

  set edges(value: Edge[]) {
    this.#edges = value
    this.#render()
  }

  /** Fits every node into the view. */
  fitView() {
    void this.#instance?.fitView(fitViewOptions)
  }

  connectedCallback() {
    // A page can set `el.nodes` before this script defines the element. The
    // value then sits on the instance and hides the setter; move it over.
    for (const key of ["nodes", "edges"] as const) {
      if (Object.hasOwn(this, key)) {
        const value: unknown = Reflect.get(this, key)
        Reflect.deleteProperty(this, key)
        Reflect.set(this, key, value)
      }
    }
    const script = this.querySelector<HTMLScriptElement>(':scope > script[type="application/json"]')
    if (script && !this.hasAttribute("nodes") && !this.#nodes.length) {
      const data = JSON.parse(script.textContent || "{}") as { nodes?: Node[]; edges?: Edge[] }
      this.#nodes = data.nodes ?? []
      this.#edges = data.edges ?? []
    }

    connected.add(this)
    watchClasses()
    this.syncTheme()
    this.#root ??= createRoot(this.#container)
    this.#render()
  }

  disconnectedCallback() {
    connected.delete(this)
    this.#root?.unmount()
    this.#root = undefined
    this.#instance = undefined
  }

  attributeChangedCallback(name: string, _old: string | null, value: string | null) {
    if (name === "nodes") this.nodes = parseList<Node>(value, name)
    else if (name === "edges") this.edges = parseList<Edge>(value, name)
    else if (name === "theme") this.syncTheme()
    else this.#render()
  }

  /** Applies the `theme` attribute, or the nearest `.dark` class above. */
  syncTheme() {
    const theme = this.getAttribute("theme")
    const dark = theme === "dark" || (theme !== "light" && this.closest(".dark") !== null)
    if (dark) this.#internals.states.add("dark")
    else this.#internals.states.delete("dark")
    this.#container.classList.toggle("dark", dark)
  }

  #emit(type: string, detail: object) {
    this.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }))
  }

  #onNodesChange = (changes: NodeChange[]) => {
    this.#nodes = applyNodeChanges(changes, this.#nodes)
    this.#render()
    this.#emit("gc-nodes-change", { changes, nodes: this.#nodes })
  }

  #onEdgesChange = (changes: EdgeChange[]) => {
    this.#edges = applyEdgeChanges(changes, this.#edges)
    this.#render()
    this.#emit("gc-edges-change", { changes, edges: this.#edges })
  }

  #onConnect = (connection: Connection) => {
    this.#edges = addEdge(connection, this.#edges)
    this.#render()
    this.#emit("gc-connect", { connection, edges: this.#edges })
  }

  #onInit = (instance: ReactFlowInstance) => {
    this.#instance = instance
  }

  #render() {
    this.#root?.render(
      <Canvas
        nodes={this.#nodes}
        edges={this.#edges}
        grid={this.getAttribute("grid") !== "false"}
        onNodesChange={this.#onNodesChange}
        onEdgesChange={this.#onEdgesChange}
        onConnect={this.#onConnect}
        onInit={this.#onInit}
      />,
    )
  }
}

if (!customElements.get("gc-flow-canvas")) customElements.define("gc-flow-canvas", GcFlowCanvas)

declare global {
  interface HTMLElementTagNameMap {
    "gc-flow-canvas": GcFlowCanvas
  }
}
