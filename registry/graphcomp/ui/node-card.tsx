import { createContext, useContext, useId, type ComponentProps, type ReactNode } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Minus, Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import { useControllableState } from "@/registry/graphcomp/hooks/use-controllable-state"

type NodeCardContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  bodyId: string
}

const NodeCardContext = createContext<NodeCardContextValue | null>(null)

function useNodeCard() {
  const context = useContext(NodeCardContext)
  if (!context) throw new Error("NodeCard parts must be rendered inside <NodeCard>.")
  return context
}

export const nodeSpring = { type: "spring", bounce: 0, duration: 0.35 } as const

type NodeCardProps = ComponentProps<"div"> & {
  /** Pass the `selected` prop that React Flow gives a custom node. */
  selected?: boolean
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function NodeCard({
  selected,
  open: openProp,
  defaultOpen = true,
  onOpenChange,
  className,
  children,
  ...props
}: NodeCardProps) {
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })
  const bodyId = useId()

  return (
    <NodeCardContext.Provider value={{ open, setOpen, bodyId }}>
      <div
        data-slot="node-card"
        data-state={open ? "open" : "closed"}
        data-selected={selected || undefined}
        className={cn(
          "group/node relative min-w-44 rounded-gc border border-gc-node-border bg-gc-node text-[12px] text-gc-fg shadow-gc",
          "transition-[border-color,box-shadow] duration-150",
          "data-selected:border-gc-accent data-selected:ring-1 data-selected:ring-gc-accent/40",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </NodeCardContext.Provider>
  )
}

export function NodeHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="node-header"
      className={cn(
        "flex h-11 items-center gap-2.5 rounded-t-gc bg-gc-node-header px-3",
        "group-data-[state=closed]/node:rounded-b-gc",
        className,
      )}
      {...props}
    />
  )
}

/** The ring indicator at the start of a header. */
export function NodeStatus({
  active = true,
  className,
  ...props
}: ComponentProps<"span"> & { active?: boolean }) {
  return (
    <span
      data-slot="node-status"
      data-active={active || undefined}
      className={cn(
        "grid size-4 shrink-0 place-items-center rounded-full border-2 border-gc-muted/70",
        className,
      )}
      {...props}
    >
      <motion.span
        className="size-2 rounded-full bg-gc-accent"
        initial={false}
        animate={{ scale: active ? 1 : 0, opacity: active ? 1 : 0 }}
        transition={nodeSpring}
      />
    </span>
  )
}

export function NodeTitle({
  eyebrow,
  className,
  children,
  ...props
}: ComponentProps<"div"> & { eyebrow?: ReactNode }) {
  return (
    <div data-slot="node-title" className={cn("flex min-w-0 flex-col", className)} {...props}>
      {eyebrow ? <span className="text-[10px] leading-3 text-gc-muted">{eyebrow}</span> : null}
      <span className="truncate text-[12px] leading-4 font-medium">{children}</span>
    </div>
  )
}

/** A round icon button at the end of a header. Always pass `aria-label`. */
export function NodeAction({ className, ...props }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      data-slot="node-action"
      className={cn(
        "nodrag ml-auto grid size-5 shrink-0 place-items-center rounded-full bg-gc-inset text-gc-muted",
        "transition-colors hover:text-gc-fg focus-visible:ring-2 focus-visible:ring-gc-ring focus-visible:outline-none",
        "[&_svg]:size-3",
        className,
      )}
      {...props}
    />
  )
}

/** A header action that opens and closes the node body. */
export function NodeCollapseTrigger({ className, ...props }: ComponentProps<"button">) {
  const { open, setOpen, bodyId } = useNodeCard()
  return (
    <NodeAction
      aria-expanded={open}
      aria-controls={bodyId}
      aria-label={open ? "Collapse" : "Expand"}
      onClick={() => setOpen(!open)}
      className={className}
      {...props}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={open ? "open" : "closed"}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={nodeSpring}
          className="grid place-items-center"
        >
          {open ? <Minus strokeWidth={3} /> : <Plus strokeWidth={3} />}
        </motion.span>
      </AnimatePresence>
    </NodeAction>
  )
}

/**
 * The collapsible part of a node. Height animates between 0 and auto.
 * Overflow is clipped only while animating, so popovers inside the body
 * (NodeSelect) are not cut off when the body is open.
 */
export function NodeBody({ className, children }: { className?: string; children?: ReactNode }) {
  const { open, bodyId } = useNodeCard()
  return (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div
          key="body"
          id={bodyId}
          data-slot="node-body"
          initial={{ height: 0, opacity: 0, overflow: "hidden" }}
          animate={{ height: "auto", opacity: 1, transitionEnd: { overflow: "visible" } }}
          exit={{ height: 0, opacity: 0, overflow: "hidden" }}
          transition={nodeSpring}
        >
          <div className={cn("flex flex-col gap-3 p-3", className)}>{children}</div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

/** The pill bar at the bottom of an open node. Clicking it collapses the node. */
export function NodeGrip({ className, ...props }: ComponentProps<"button">) {
  const { open, setOpen, bodyId } = useNodeCard()
  if (!open) return null
  return (
    <button
      type="button"
      data-slot="node-grip"
      aria-expanded={open}
      aria-controls={bodyId}
      aria-label="Collapse"
      onClick={() => setOpen(false)}
      className={cn(
        "nodrag grid h-3.5 w-full place-items-center rounded-b-gc bg-gc-node-header",
        "focus-visible:ring-2 focus-visible:ring-gc-ring focus-visible:outline-none",
        className,
      )}
      {...props}
    >
      <span className="h-0.75 w-6 rounded-full bg-gc-muted/80" />
    </button>
  )
}

/** A label and a control on one row. */
export function NodeField({
  label,
  className,
  children,
  ...props
}: ComponentProps<"div"> & { label: ReactNode }) {
  return (
    <div
      data-slot="node-field"
      className={cn("grid grid-cols-[4.5rem_1fr] items-center gap-2", className)}
      {...props}
    >
      <span className="text-[12px] text-gc-fg/90">{label}</span>
      {children}
    </div>
  )
}

/** An inset surface inside a node body. */
export function NodePanel({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="node-panel"
      className={cn("rounded-gc bg-gc-panel p-2.5", className)}
      {...props}
    />
  )
}
