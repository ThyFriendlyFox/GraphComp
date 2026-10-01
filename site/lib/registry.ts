import manifest from "../../registry.json"

// Set VITE_REGISTRY_URL at build time when the registry is served from another host.
export const REGISTRY_URL = (
  import.meta.env.VITE_REGISTRY_URL ?? "https://thyfriendlyfox.github.io/GraphComp/r"
).replace(/\/$/, "")
export const REPO_URL = "https://github.com/ThyFriendlyFox/GraphComp"

type ManifestItem = (typeof manifest.items)[number] & {
  dependencies?: string[]
  registryDependencies?: string[]
}

export type RegistryFile = { path: string; target: string; source: string }

export type RegistryItem = {
  name: string
  type: string
  title: string
  description: string
  dependencies: string[]
  registryDependencies: string[]
  files: RegistryFile[]
}

const sources = import.meta.glob<string>("/registry/graphcomp/**/*.{ts,tsx,css}", {
  query: "?raw",
  import: "default",
  eager: true,
})

/** Rewrites registry imports the way the shadcn CLI does with default aliases. */
export function toUserImports(source: string) {
  return source
    .replace(/@\/registry\/graphcomp\/ui\//g, "@/components/ui/")
    .replace(/@\/registry\/graphcomp\/hooks\//g, "@/hooks/")
    .replace(/@\/registry\/graphcomp\/blocks\/[\w-]+\//g, "@/components/")
}

function target(file: { path: string; type: string; target?: string }) {
  if (file.target) return file.target
  const name = file.path.split("/").pop()
  return file.type === "registry:hook" ? `hooks/${name}` : `components/ui/${name}`
}

export const registry: RegistryItem[] = (manifest.items as ManifestItem[]).map((item) => ({
  name: item.name,
  type: item.type,
  title: item.title,
  description: item.description,
  dependencies: item.dependencies ?? [],
  registryDependencies: item.registryDependencies ?? [],
  files: item.files.map((file) => ({
    path: file.path,
    target: target(file),
    source: toUserImports(sources[`/${file.path}`] ?? ""),
  })),
}))

export function registryItem(name: string) {
  const item = registry.find((entry) => entry.name === name)
  if (!item) throw new Error(`Unknown registry item: ${name}`)
  return item
}

export function installUrl(name: string) {
  return `${REGISTRY_URL}/${name}.json`
}
