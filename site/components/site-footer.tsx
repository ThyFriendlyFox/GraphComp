import { REPO_URL } from "../lib/registry"

export function SiteFooter() {
  const link = "font-medium underline underline-offset-4 hover:text-gc-fg"
  return (
    <footer className="border-t border-gc-node-border/70">
      <div className="mx-auto max-w-7xl px-4 py-6 text-[13px] text-gc-muted sm:px-6">
        Built on{" "}
        <a className={link} href="https://reactflow.dev">
          React Flow
        </a>
        ,{" "}
        <a className={link} href="https://tailwindcss.com">
          Tailwind CSS
        </a>{" "}
        and{" "}
        <a className={link} href="https://motion.dev">
          Motion
        </a>
        . The source is on{" "}
        <a className={link} href={REPO_URL}>
          GitHub
        </a>{" "}
        under the MIT license.
      </div>
    </footer>
  )
}
