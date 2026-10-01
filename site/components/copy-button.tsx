import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Check, Copy } from "lucide-react"

import { cn } from "@/lib/utils"

export function CopyButton({
  value,
  label = "Copy",
  className,
}: {
  value: string
  label?: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(timer)
  }, [copied])

  async function copy() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
  }

  return (
    <button
      type="button"
      aria-label={copied ? "Copied" : label}
      onClick={copy}
      className={cn(
        "grid size-7 shrink-0 place-items-center rounded-gc text-gc-muted transition-colors",
        "hover:bg-gc-control/60 hover:text-gc-fg focus-visible:ring-2 focus-visible:ring-gc-ring focus-visible:outline-none",
        "[&_svg]:size-3.5",
        className,
      )}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={copied ? "copied" : "copy"}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.6, opacity: 0 }}
          transition={{ type: "spring", bounce: 0, duration: 0.25 }}
          className="grid place-items-center"
        >
          {copied ? <Check className="text-gc-accent" /> : <Copy />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
