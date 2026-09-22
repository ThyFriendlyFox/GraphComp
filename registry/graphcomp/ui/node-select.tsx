import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react"
import { AnimatePresence, motion } from "motion/react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { useControllableState } from "@/registry/graphcomp/hooks/use-controllable-state"

export type NodeSelectOption<T extends string> = {
  value: T
  label: ReactNode
  disabled?: boolean
}

type NodeSelectProps<T extends string> = {
  options: NodeSelectOption<T>[]
  value?: T
  defaultValue?: T
  onValueChange?: (value: T) => void
  /** Shown in the trigger when nothing is selected, and as the list heading. */
  placeholder?: ReactNode
  className?: string
  "aria-label"?: string
}

/**
 * A select whose list opens over its own trigger. The list renders inside
 * the node, not in a portal, so it pans and zooms with the canvas.
 */
export function NodeSelect<T extends string>({
  options,
  value: valueProp,
  defaultValue,
  onValueChange,
  placeholder = "Select",
  className,
  "aria-label": ariaLabel,
}: NodeSelectProps<T>) {
  const [value, setValue] = useControllableState<T | undefined>({
    value: valueProp,
    defaultValue,
    onChange: onValueChange as ((value: T | undefined) => void) | undefined,
  })
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const id = useId()
  const selected = options.find((option) => option.value === value)

  useEffect(() => {
    if (!open) return
    listRef.current?.focus()
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [open])

  function show() {
    const index = options.findIndex((option) => option.value === value)
    setActive(index === -1 ? firstEnabled(options, 0, 1) : index)
    setOpen(true)
  }

  function close() {
    setOpen(false)
    triggerRef.current?.focus()
  }

  function choose(index: number) {
    const option = options[index]
    if (!option || option.disabled) return
    setValue(option.value)
    close()
  }

  function onTriggerKeyDown(event: KeyboardEvent) {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
      event.preventDefault()
      show()
    }
  }

  function onListKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault()
        setActive((index) => firstEnabled(options, index + 1, 1))
        break
      case "ArrowUp":
        event.preventDefault()
        setActive((index) => firstEnabled(options, index - 1, -1))
        break
      case "Home":
        event.preventDefault()
        setActive(firstEnabled(options, 0, 1))
        break
      case "End":
        event.preventDefault()
        setActive(firstEnabled(options, options.length - 1, -1))
        break
      case "Enter":
      case " ":
        event.preventDefault()
        choose(active)
        break
      case "Escape":
        event.preventDefault()
        close()
        break
      case "Tab":
        setOpen(false)
        break
    }
  }

  return (
    <div ref={rootRef} data-slot="node-select" className={cn("nodrag nowheel relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onTriggerKeyDown}
        className={cn(
          "flex h-8 w-full items-center justify-between gap-2 rounded-gc bg-gc-inset px-2.5 text-left text-[12px]",
          "focus-visible:ring-2 focus-visible:ring-gc-ring focus-visible:outline-none",
          selected ? "text-gc-fg" : "text-gc-muted",
        )}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <ChevronDown className="size-3.5 shrink-0 text-gc-muted" />
      </button>
      <AnimatePresence>
        {open ? (
          <motion.ul
            ref={listRef}
            id={`${id}-list`}
            role="listbox"
            tabIndex={-1}
            aria-label={ariaLabel}
            aria-activedescendant={`${id}-option-${active}`}
            onKeyDown={onListKeyDown}
            initial={{ opacity: 0, scaleY: 0.9, y: -2 }}
            animate={{ opacity: 1, scaleY: 1, y: 0 }}
            exit={{ opacity: 0, scaleY: 0.95, y: -2, transition: { duration: 0.12 } }}
            transition={{ type: "spring", bounce: 0, duration: 0.25 }}
            className={cn(
              "absolute inset-x-0 top-0 z-20 origin-top overflow-hidden rounded-gc bg-gc-accent-strong py-1 text-[12px] text-gc-accent-fg shadow-gc",
              "focus:outline-none",
            )}
          >
            <li
              role="presentation"
              className="flex h-6 items-center justify-between px-2.5 text-gc-accent-fg/60"
            >
              {placeholder}
              <ChevronDown className="size-3.5 rotate-180" />
            </li>
            {options.map((option, index) => (
              <li
                key={option.value}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={option.value === value}
                aria-disabled={option.disabled || undefined}
                onPointerEnter={() => !option.disabled && setActive(index)}
                onClick={() => choose(index)}
                className={cn(
                  "flex h-6 cursor-default items-center px-2.5",
                  index === active && "bg-white/15",
                  option.disabled && "text-gc-accent-fg/40",
                )}
              >
                {option.label}
              </li>
            ))}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function firstEnabled<T extends string>(
  options: NodeSelectOption<T>[],
  start: number,
  direction: 1 | -1,
) {
  const count = options.length
  for (let i = 0; i < count; i++) {
    const index = (((start + i * direction) % count) + count) % count
    if (!options[index].disabled) return index
  }
  return 0
}
