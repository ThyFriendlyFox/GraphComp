import { useEffect, useRef, useState, type ComponentType } from "react"
import { ReactFlowProvider } from "@xyflow/react"
import { Pause, Play } from "lucide-react"

import { cn } from "@/lib/utils"
import { useAutoplay, type Step } from "../lib/autoplay"
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
  script,
  className,
}: {
  demo: ComponentType
  /** Plays the demo by itself until the user presses inside the frame. */
  script?: Step[]
  className?: string
}) {
  const ref = usePageScrollOverCanvas<HTMLDivElement>()
  const cursorRef = useRef<HTMLDivElement>(null)
  const { playing, setPlaying, enabled } = useAutoplay(ref, cursorRef, script)

  return (
    <div
      ref={ref}
      data-slot="canvas-frame"
      data-autoplay={enabled ? (playing ? "playing" : "paused") : undefined}
      className={cn("relative h-[420px] overflow-hidden bg-gc-canvas", className)}
    >
      <ReactFlowProvider>
        <Demo />
      </ReactFlowProvider>
      {enabled ? (
        <>
          <div
            ref={cursorRef}
            aria-hidden="true"
            className="pointer-events-none absolute top-0 left-0 z-20 opacity-0 drop-shadow-[0_2px_4px_rgb(0_0_0/0.45)]"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              className="-translate-x-[3px] -translate-y-[2px]"
            >
              <path
                d="M3 2.5 18 11l-6.6 1.6L8 19z"
                fill="var(--gc-fg)"
                stroke="var(--gc-canvas)"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <button
            type="button"
            data-autoplay-control
            aria-label={playing ? "Pause demo" : "Play demo"}
            onClick={() => setPlaying(!playing)}
            className={cn(
              "absolute bottom-3 left-3 z-20 flex h-7 items-center gap-1.5 rounded-full border border-gc-node-border",
              "bg-gc-node/85 pr-2.5 pl-2 text-[11px] text-gc-muted backdrop-blur-sm transition-colors hover:text-gc-fg",
              "focus-visible:ring-2 focus-visible:ring-gc-ring focus-visible:outline-none [&_svg]:size-3",
            )}
          >
            {playing ? <Pause /> : <Play />}
            {playing ? "Pause" : "Play"}
          </button>
        </>
      ) : null}
    </div>
  )
}

/** A live demo with a tab that shows its source. */
export function Preview({
  demo,
  code,
  script,
  className,
}: {
  demo: ComponentType
  code: string
  script?: Step[]
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
        <CanvasFrame
          demo={demo}
          script={script}
          className="rounded-lg border border-gc-node-border"
        />
      ) : (
        <CodeBlock code={code} maxHeight={560} />
      )}
    </div>
  )
}
