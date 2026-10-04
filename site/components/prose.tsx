import type { ComponentProps, ReactNode } from "react"

import { cn } from "@/lib/utils"
import { Link } from "../lib/router"

function slug(text: unknown) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export function H1({ className, ...props }: ComponentProps<"h1">) {
  return (
    <h1
      className={cn("text-3xl font-semibold tracking-tight text-balance sm:text-4xl", className)}
      {...props}
    />
  )
}

export function Lead({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("text-[16px] text-pretty text-gc-muted", className)} {...props} />
}

export function H2({ className, children, ...props }: ComponentProps<"h2">) {
  const id = slug(children)
  return (
    <h2
      id={id}
      className={cn(
        "mt-12 scroll-mt-20 border-b border-gc-node-border pb-2 text-xl font-semibold tracking-tight",
        className,
      )}
      {...props}
    >
      {children}
    </h2>
  )
}

export function H3({ className, ...props }: ComponentProps<"h3">) {
  return <h3 className={cn("mt-8 text-[15px] font-semibold", className)} {...props} />
}

export function P({ className, ...props }: ComponentProps<"p">) {
  return (
    <p className={cn("leading-7 text-gc-fg/90 [&:not(:first-child)]:mt-4", className)} {...props} />
  )
}

export function Code({ className, ...props }: ComponentProps<"code">) {
  return (
    <code
      className={cn(
        "rounded-[3px] bg-gc-control/50 px-1.5 py-0.5 font-mono text-[0.85em] text-gc-fg",
        className,
      )}
      {...props}
    />
  )
}

export function List({ className, ...props }: ComponentProps<"ul">) {
  return (
    <ul
      className={cn(
        "mt-4 ml-5 list-disc space-y-2 leading-7 text-gc-fg/90 marker:text-gc-muted",
        className,
      )}
      {...props}
    />
  )
}

export function Steps({ className, ...props }: ComponentProps<"ol">) {
  return (
    <ol
      className={cn(
        "mt-6 ml-3.5 border-l border-gc-node-border pl-7 [counter-reset:step]",
        "[&>li]:relative [&>li]:pb-8 [&>li]:[counter-increment:step] [&>li:last-child]:pb-0",
        "[&>li]:before:absolute [&>li]:before:-left-[42px] [&>li]:before:grid [&>li]:before:size-7 [&>li]:before:place-items-center",
        "[&>li]:before:rounded-full [&>li]:before:bg-gc-control [&>li]:before:font-mono [&>li]:before:text-[12px] [&>li]:before:content-[counter(step)]",
        className,
      )}
      {...props}
    />
  )
}

export function TextLink({ to, className, ...props }: ComponentProps<"a"> & { to: string }) {
  const style = cn("font-medium text-gc-accent underline-offset-4 hover:underline", className)
  if (/^https?:/.test(to)) return <a href={to} className={style} {...props} />
  return <Link to={to} className={style} {...props} />
}

export function Table({
  head,
  rows,
  className,
}: {
  head: string[]
  rows: ReactNode[][]
  className?: string
}) {
  return (
    <div className={cn("mt-4 overflow-x-auto rounded-lg border border-gc-node-border", className)}>
      <table className="w-full text-left text-[13px]">
        <thead className="bg-gc-inset text-gc-muted">
          <tr>
            {head.map((cell) => (
              <th key={cell} className="px-4 py-2.5 font-medium whitespace-nowrap">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-t border-gc-node-border align-top">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-2.5 leading-6">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Renders `backtick` spans in a plain string as inline code. */
export function Inline({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/(`[^`]+`)/)
        .map((part, index) =>
          part.startsWith("`") ? <Code key={index}>{part.slice(1, -1)}</Code> : part,
        )}
    </>
  )
}
