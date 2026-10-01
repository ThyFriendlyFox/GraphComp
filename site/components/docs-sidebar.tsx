import { componentDocs } from "../content/docs"
import { registryItem } from "../lib/registry"
import { Link, usePath } from "../lib/router"

const gettingStarted = [
  { to: "/docs", label: "Introduction" },
  { to: "/docs/installation", label: "Installation" },
  { to: "/docs/theming", label: "Theming" },
]

const groups = ["Canvas", "Nodes", "Widgets", "Blocks"] as const

export const sections = [
  { title: "Getting Started", links: gettingStarted },
  ...groups.map((group) => ({
    title: group,
    links: componentDocs
      .filter((doc) => doc.group === group)
      .map((doc) => ({ to: `/docs/components/${doc.name}`, label: registryItem(doc.name).title })),
  })),
]

export function DocsSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePath()

  return (
    <nav aria-label="Docs" className="flex flex-col gap-6 text-[13px]">
      {sections.map((section) => (
        <div key={section.title} className="flex flex-col gap-0.5">
          <h4 className="mb-1 px-2 text-[12px] font-medium text-gc-muted">{section.title}</h4>
          {section.links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={onNavigate}
              aria-current={path === link.to ? "page" : undefined}
              className="rounded-gc px-2 py-1.5 text-gc-fg/80 transition-colors hover:bg-gc-control/40 hover:text-gc-fg focus-visible:ring-2 focus-visible:ring-gc-ring focus-visible:outline-none aria-[current=page]:bg-gc-control/60 aria-[current=page]:font-medium aria-[current=page]:text-gc-fg"
            >
              {link.label}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  )
}
