import { useEffect, useRef, useState, type RefObject } from "react"
import { animate } from "motion/react"

/**
 * Autoplay for the live previews. A script of steps drives the real
 * components with synthetic pointer, mouse and key events, the same events a
 * user sends, so every motion on screen is the component's own. A drawn
 * cursor shows where each event lands.
 */

type Find = (root: Element) => Element | null | undefined

export type Step =
  | { click: Find }
  | { drag: Find; by: [number, number] }
  | { connect: [Find, Find] }
  | { key: string }
  | { type: Find; text: string }
  | { wait: number }

// Finders. Each takes the element to search in and returns the target.

export const select =
  (selector: string): Find =>
  (root) =>
    root.querySelector(selector)

export const label = (name: string) => select(`[aria-label="${name}"]`)

function byText(selector: string, text: string): Find {
  return (root) =>
    [...root.querySelectorAll(selector)].find((element) => element.textContent?.trim() === text)
}

export const radio = (name: string) => byText('[role="radio"]', name)
export const option = (name: string) => byText('[role="option"]', name)

/** The `NodeCard` whose title contains `title`, or a target inside it. */
export function card(title: string, find?: Find): Find {
  return (root) => {
    const found = [...root.querySelectorAll('[data-slot="node-card"]')].find((element) =>
      element.querySelector('[data-slot="node-title"]')?.textContent?.includes(title),
    )
    return found && find ? find(found) : found
  }
}

/** The `NodeField` with this label, or a target inside it. */
export function field(name: string, find: Find): Find {
  return (root) => {
    const found = [...root.querySelectorAll('[data-slot="node-field"]')].find(
      (element) => element.firstElementChild?.textContent?.trim() === name,
    )
    return found && find(found)
  }
}

/** The React Flow node with this id, or a target inside it. */
export function node(id: string, find?: Find): Find {
  return (root) => {
    const found = root.querySelector(`.react-flow__node[data-id="${id}"]`)
    return found && find ? find(found) : found
  }
}

export const header = (title: string) => card(title, select('[data-slot="node-header"]'))
export const port = (nodeId: string, handleId: string) =>
  node(nodeId, select(`.react-flow__handle[data-handleid="${handleId}"]`))

// Events.

const MOVE = 0.45
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function center(element: Element) {
  const rect = element.getBoundingClientRect()
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
}

function pointer(type: string, target: EventTarget, x: number, y: number) {
  const init = {
    bubbles: true,
    cancelable: true,
    composed: true,
    clientX: x,
    clientY: y,
    button: 0,
    view: window,
  }
  const isPointer = type.startsWith("pointer")
  const event = isPointer
    ? new PointerEvent(type, {
        ...init,
        pointerId: 1,
        pointerType: "mouse",
        isPrimary: true,
        buttons: type === "pointerup" ? 0 : 1,
      })
    : new MouseEvent(type, { ...init, buttons: type === "mouseup" || type === "click" ? 0 : 1 })
  target.dispatchEvent(event)
}

type Cursor = { element: HTMLElement; frame: HTMLElement }

function moveCursor(cursor: Cursor, x: number, y: number, duration = MOVE) {
  const frame = cursor.frame.getBoundingClientRect()
  return animate(
    cursor.element,
    { x: x - frame.left, y: y - frame.top, opacity: 1 },
    { type: "spring", bounce: 0, duration },
  )
}

const pressCursor = (cursor: Cursor, down: boolean) =>
  animate(
    cursor.element,
    { scale: down ? 0.82 : 1 },
    { type: "spring", bounce: 0.3, duration: 0.2 },
  )

/** Moves the mouse along a straight line, one event and one cursor position per frame. */
async function glide(
  cursor: Cursor,
  from: { x: number; y: number },
  to: { x: number; y: number },
  ms: number,
) {
  const frame = cursor.frame.getBoundingClientRect()
  const start = performance.now()
  for (;;) {
    await new Promise(requestAnimationFrame)
    const t = Math.min(1, (performance.now() - start) / ms)
    const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2
    const x = from.x + (to.x - from.x) * eased
    const y = from.y + (to.y - from.y) * eased
    cursor.element.style.transform = `translateX(${x - frame.left}px) translateY(${y - frame.top}px) scale(0.82)`
    pointer("pointermove", document, x, y)
    pointer("mousemove", document, x, y)
    if (t === 1) return
  }
}

/**
 * Sets a text field's value through the native setter, then sends an input
 * event. React reads the change the same way it reads typing.
 */
function setText(field: HTMLInputElement | HTMLTextAreaElement, text: string) {
  const prototype = Object.getPrototypeOf(field) as HTMLInputElement | HTMLTextAreaElement
  Object.getOwnPropertyDescriptor(prototype, "value")?.set?.call(field, text)
  field.dispatchEvent(new Event("input", { bubbles: true }))
}

/** Deletes back to the shared start, then adds `text` one character per step. */
async function typeInto(field: HTMLInputElement | HTMLTextAreaElement, text: string) {
  let shared = 0
  while (shared < field.value.length && field.value[shared] === text[shared]) shared++
  for (let length = field.value.length - 1; length >= shared; length--) {
    setText(field, field.value.slice(0, length))
    await sleep(18)
  }
  for (let length = shared + 1; length <= text.length; length++) {
    setText(field, text.slice(0, length))
    await sleep(45)
  }
}

async function play(step: Step, root: HTMLElement, cursor: Cursor) {
  if ("wait" in step) return sleep(step.wait)

  if ("type" in step) {
    const field = step.type(root)
    if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) return
    const { x, y } = center(field)
    await moveCursor(cursor, x, y)
    await typeInto(field, step.text)
    return sleep(320)
  }

  if ("key" in step) {
    const init = { key: step.key, bubbles: true, cancelable: true }
    document.body.dispatchEvent(new KeyboardEvent("keydown", init))
    document.body.dispatchEvent(new KeyboardEvent("keyup", init))
    return
  }

  if ("click" in step) {
    const target = step.click(root)
    if (!target) return
    const { x, y } = center(target)
    await moveCursor(cursor, x, y)
    await sleep(120)
    pressCursor(cursor, true)
    pointer("pointerdown", target, x, y)
    pointer("mousedown", target, x, y)
    await sleep(110)
    pressCursor(cursor, false)
    pointer("pointerup", target, x, y)
    pointer("mouseup", target, x, y)
    pointer("click", target, x, y)
    return sleep(320)
  }

  const source = "drag" in step ? step.drag(root) : step.connect[0](root)
  const target = "connect" in step ? step.connect[1](root) : undefined
  if (!source || ("connect" in step && !target)) return
  const from = center(source)
  const end = "drag" in step ? { x: from.x + step.by[0], y: from.y + step.by[1] } : center(target!)
  await moveCursor(cursor, from.x, from.y)
  await sleep(120)
  pressCursor(cursor, true)
  pointer("pointerdown", source, from.x, from.y)
  pointer("mousedown", source, from.x, from.y)
  await glide(cursor, from, end, 700)
  pointer("pointerup", document, end.x, end.y)
  pointer("mouseup", document, end.x, end.y)
  pressCursor(cursor, false)
  return sleep(320)
}

/**
 * Plays `script` in a loop while the frame is on screen. A real pointer
 * press or key press inside the frame stops it; synthetic events are not
 * trusted, so the script never stops itself. Reduced motion starts it paused.
 */
export function useAutoplay(
  frameRef: RefObject<HTMLElement | null>,
  cursorRef: RefObject<HTMLElement | null>,
  script: Step[] | undefined,
) {
  const [playing, setPlaying] = useState(
    () => Boolean(script) && !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  )
  const visible = useRef(false)

  useEffect(() => {
    const frame = frameRef.current
    if (!frame || !script) return
    const stop = (event: Event) => {
      const control = (event.target as Element).closest?.("[data-autoplay-control]")
      if (event.isTrusted && !control) setPlaying(false)
    }
    frame.addEventListener("pointerdown", stop, { capture: true })
    frame.addEventListener("keydown", stop, { capture: true })
    const observer = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting
    })
    observer.observe(frame)
    return () => {
      frame.removeEventListener("pointerdown", stop, { capture: true })
      frame.removeEventListener("keydown", stop, { capture: true })
      observer.disconnect()
    }
  }, [frameRef, script])

  useEffect(() => {
    const frame = frameRef.current
    const element = cursorRef.current
    if (!frame || !element || !script || !playing) {
      if (element) animate(element, { opacity: 0 }, { duration: 0.2 })
      return
    }
    let cancelled = false
    const live = () => !cancelled
    const cursor = { element, frame }

    async function loop() {
      await sleep(900)
      while (live()) {
        for (const step of script!) {
          while (live() && (!visible.current || document.hidden)) await sleep(250)
          if (!live()) return
          await play(step, frame!, cursor)
        }
        await sleep(1200)
      }
    }
    loop()
    return () => {
      cancelled = true
    }
  }, [frameRef, cursorRef, script, playing])

  return { playing, setPlaying, enabled: Boolean(script) }
}
