import { useEffect, useRef, useState, type ComponentType } from "react"
import { ReactFlowProvider } from "@xyflow/react"

import { cn } from "@/lib/utils"
import { CodeBlock } from "./code-block"
import { Tabs } from "./tabs"

/**
 * Lets the wheel scroll the page over a canvas. React Flow zooms on wheel and
 * blocks page scroll; a capture listener on the frame stops the event before
 * React Flow sees it. Pinch (ctrl + wheel) still zooms the canvas.
 */
export function usePageScrollOverCanvas<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) event.stopPropagation()
    }
    element.addEventListener("wheel", onWheel, { capture: true })
    return () => element.removeEventListener("wheel", onWheel, { capture: true })
  }, [])
  return ref
}

export function CanvasFrame({
  demo: Demo,
  className,
}: {
  demo: ComponentType
  className?: string
}) {
  const ref = usePageScrollOverCanvas<HTMLDivElement>()
  return (
    <div
      ref={ref}
      data-slot="canvas-frame"
      className={cn("relative h-[420px] overflow-hidden bg-gc-canvas", className)}
    >
      <ReactFlowProvider>
        <Demo />
      </ReactFlowProvider>
    </div>
  )
}

/** A live demo with a tab that shows its source. */
export function Preview({
  demo,
  code,
  className,
}: {
  demo: ComponentType
  code: string
  className?: string
}) {
  const [tab, setTab] = useState<"preview" | "code">("preview")

  return (
    <div data-slot="preview" className={cn("flex flex-col gap-2", className)}>
      <Tabs
        label="Example"
        tabs={[
          { value: "preview", label: "Preview" },
          { value: "code", label: "Code" },
        ]}
        value={tab}
        onValueChange={setTab}
        className="border-b border-gc-node-border"
      />
      {tab === "preview" ? (
        <CanvasFrame demo={demo} className="rounded-lg border border-gc-node-border" />
      ) : (
        <CodeBlock code={code} maxHeight={560} />
      )}
    </div>
  )
}
