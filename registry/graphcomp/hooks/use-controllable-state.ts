import { useCallback, useState } from "react"

/**
 * State that a parent may control. When `value` is undefined the hook keeps
 * its own state, seeded from `defaultValue`. `onChange` fires in both modes.
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: {
  value?: T
  defaultValue: T
  onChange?: (value: T) => void
}) {
  const [internal, setInternal] = useState(defaultValue)
  const controlled = value !== undefined
  const current = controlled ? value : internal

  const setValue = useCallback(
    (next: T) => {
      if (!controlled) setInternal(next)
      onChange?.(next)
    },
    [controlled, onChange],
  )

  return [current, setValue] as const
}
