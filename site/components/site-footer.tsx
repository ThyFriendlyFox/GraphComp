import { REPO_URL } from "../lib/registry"

export function SiteFooter() {
  const link = "font-medium underline underline-offset-4 hover:text-gc-fg"
  return (
    <footer className="border-t border-gc-node-border/70">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-[13px] text-gc-muted sm:px-6">
        <p>
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
        </p>
        {/* UsefulShelf listing badge. The free dofollow listing goes private if
            this link is removed or gets rel="nofollow", "sponsored" or "ugc". */}
        <a
          href="https://usefulshelf.co/?utm_source=graphcomp.reagent-systems.com&utm_medium=referral&utm_campaign=badge&utm_content=lime"
          target="_blank"
          rel="noopener"
        >
          <img
            src="https://usefulshelf.co/badge/usefulshelf.svg?theme=lime"
            alt="Featured on UsefulShelf"
            width="248"
            height="66"
          />
        </a>
      </div>
    </footer>
  )
}
