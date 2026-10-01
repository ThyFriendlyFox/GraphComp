import { useEffect, useState, type ReactNode } from "react"

import { cn } from "@/lib/utils"
import { highlight, type Lang } from "../lib/highlight"
import { CopyButton } from "./copy-button"

/** A highlighted code block with a copy button. Shows plain text until the highlighter loads. */
export function CodeBlock({
  code,
  lang = "tsx",
  title,
  className,
  maxHeight,
}: {
  code: string
  lang?: Lang
  title?: ReactNode
  className?: string
  maxHeight?: number
}) {
  const trimmed = code.trim()
  const [html, setHtml] = useState<{ code: string; html: string }>()

  useEffect(() => {
    let live = true
    highlight(trimmed, lang).then((result) => live && setHtml({ code: trimmed, html: result }))
    return () => {
      live = false
    }
  }, [trimmed, lang])

  return (
    <div
      data-slot="code-block"
      className={cn(
        "group/code relative overflow-hidden rounded-lg border border-gc-node-border bg-gc-inset",
        className,
      )}
    >
      {title ? (
        <div className="flex h-10 items-center justify-between border-b border-gc-node-border px-4 font-mono text-[12px] text-gc-muted">
          <span className="truncate">{title}</span>
          <CopyButton value={trimmed} label="Copy code" className="-mr-2" />
        </div>
      ) : (
        <CopyButton value={trimmed} label="Copy code" className="absolute top-2 right-2 z-10" />
      )}
      <div className="site-code overflow-auto" style={{ maxHeight }}>
        {html?.code === trimmed ? (
          <div dangerouslySetInnerHTML={{ __html: html.html }} />
        ) : (
          <pre>
            <code>{trimmed}</code>
          </pre>
        )}
      </div>
    </div>
  )
}
