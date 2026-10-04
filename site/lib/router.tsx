import { useSyncExternalStore, type ComponentProps, type MouseEvent } from "react"

// Vite `base`; non-empty only when the site is served under a sub-path.
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "")

function subscribe(callback: () => void) {
  window.addEventListener("popstate", callback)
  return () => window.removeEventListener("popstate", callback)
}

function currentPath() {
  const path = window.location.pathname.slice(BASE.length) || "/"
  return path.length > 1 ? path.replace(/\/$/, "") : path
}

export function usePath() {
  return useSyncExternalStore(subscribe, currentPath)
}

export function href(path: string) {
  return BASE + path
}

export function navigate(path: string) {
  const [pathname, hash] = path.split("#")
  window.history.pushState(null, "", href(pathname) + (hash ? `#${hash}` : ""))
  window.dispatchEvent(new PopStateEvent("popstate"))
  if (hash) document.getElementById(hash)?.scrollIntoView()
  else window.scrollTo(0, 0)
}

/** An anchor that changes the route without a page load. `to` is a site path. */
export function Link({ to, onClick, ...props }: ComponentProps<"a"> & { to: string }) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event)
    if (event.defaultPrevented || event.button !== 0) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    navigate(to)
  }
  return <a href={href(to)} onClick={handleClick} {...props} />
}
