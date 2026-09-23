import { useEffect, useState, type ReactNode } from "react"
import { motion, useSpring, type HTMLMotionProps } from "motion/react"

import { cn } from "@/lib/utils"

export const pressSpring = { type: "spring", bounce: 0.35, duration: 0.3 } as const

const pressVariants = {
  rest: { scale: 1 },
  hover: { scale: 1 },
  pressed: { scale: 0.92 },
}

const highlightOpacity = { rest: 0, hover: 0.1, pressed: 0.28 }

type NodePressableProps = Omit<HTMLMotionProps<"button">, "children"> & {
  children?: ReactNode
  /** Flash an accent layer on hover and press. Default `true`. */
  highlight?: boolean
}

/**
 * A button that answers every press: it shrinks on a spring and flashes an
 * accent layer, then springs back. Motion drives both, so the feedback
 * renders on every animation frame and plays on the keyboard too. The
 * highlight follows gesture state from callbacks. Its opacity is a spring
 * motion value, not an `animate` target: Motion hands opacity tweens to the
 * Web Animations API, which runs outside the frame loop that tests and
 * recordings step through.
 */
export function NodePressable({
  highlight = true,
  disabled,
  onHoverStart,
  onHoverEnd,
  onTapStart,
  onTap,
  onTapCancel,
  className,
  children,
  ...props
}: NodePressableProps) {
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  const state = disabled ? "rest" : pressed ? "pressed" : hovered ? "hover" : "rest"
  const opacity = useSpring(0, { bounce: 0, duration: 0.15 })

  useEffect(() => {
    opacity.set(highlightOpacity[state])
  }, [opacity, state])

  return (
    <motion.button
      type="button"
      data-slot="node-pressable"
      data-pressed={state === "pressed" || undefined}
      disabled={disabled}
      initial={false}
      animate="rest"
      whileHover={disabled ? undefined : "hover"}
      whileTap={disabled ? undefined : "pressed"}
      onHoverStart={(event, info) => {
        setHovered(true)
        onHoverStart?.(event, info)
      }}
      onHoverEnd={(event, info) => {
        setHovered(false)
        onHoverEnd?.(event, info)
      }}
      onTapStart={(event, info) => {
        setPressed(true)
        onTapStart?.(event, info)
      }}
      onTap={(event, info) => {
        setPressed(false)
        onTap?.(event, info)
      }}
      onTapCancel={(event, info) => {
        setPressed(false)
        onTapCancel?.(event, info)
      }}
      variants={pressVariants}
      transition={pressSpring}
      className={cn("nodrag nokey relative isolate", className)}
      {...props}
    >
      {highlight ? (
        <motion.span
          aria-hidden
          data-slot="node-pressable-highlight"
          style={{ opacity }}
          className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] bg-gc-accent"
        />
      ) : null}
      {children}
    </motion.button>
  )
}
