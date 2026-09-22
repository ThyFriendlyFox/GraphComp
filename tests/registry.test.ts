// @vitest-environment node
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"

type RegistryFile = { path: string; type: string; target?: string }
type RegistryItem = {
  name: string
  type: string
  dependencies?: string[]
  registryDependencies?: string[]
  files: RegistryFile[]
}

const root = join(import.meta.dirname, "..")
const registry = JSON.parse(readFileSync(join(root, "registry.json"), "utf8")) as {
  items: RegistryItem[]
}
const css = readFileSync(join(root, "registry/graphcomp/styles/graphcomp.css"), "utf8")
const ALWAYS_AVAILABLE = new Set(["react", "react-dom"])

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })
}

function imports(source: string) {
  return [...source.matchAll(/(?:import|export)[^'"]*?from\s+["']([^"']+)["']/g)].map((m) => m[1])
}

function packageName(specifier: string) {
  const parts = specifier.split("/")
  return specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0]
}

describe("registry.json", () => {
  it("has unique item names", () => {
    const names = registry.items.map((item) => item.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it("lists every source file exactly once, and every listed file exists", () => {
    const listed = registry.items.flatMap((item) => item.files.map((file) => file.path))
    for (const path of listed) expect(existsSync(join(root, path)), path).toBe(true)

    const sources = walk(join(root, "registry/graphcomp"))
      .map((path) => path.slice(root.length + 1))
      .filter((path) => !path.startsWith("registry/graphcomp/lib/"))
    expect([...listed].sort()).toEqual([...sources].sort())
  })

  it.each(registry.items.filter((item) => item.files.some((f) => /\.tsx?$/.test(f.path))))(
    "$name declares every import it uses",
    (item) => {
      const deps = new Set(item.dependencies ?? [])
      const registryDeps = item.registryDependencies ?? []
      const hasRegistryDep = (name: string) =>
        registryDeps.some((dep) => dep === name || dep.endsWith(`/${name}.json`))

      for (const file of item.files) {
        const source = readFileSync(join(root, file.path), "utf8")
        for (const specifier of imports(source)) {
          if (specifier === "@/lib/utils") {
            expect(hasRegistryDep("utils"), `${file.path}: ${specifier}`).toBe(true)
          } else if (specifier.startsWith("@/registry/graphcomp/")) {
            const name = specifier.split("/").pop()!
            expect(hasRegistryDep(name), `${file.path}: ${specifier}`).toBe(true)
          } else if (specifier.startsWith(".")) {
            expect(item.type, `${file.path}: relative import ${specifier}`).toBe("registry:block")
          } else if (specifier.startsWith("@/")) {
            throw new Error(`${file.path}: unsupported alias ${specifier}`)
          } else {
            const pkg = packageName(specifier)
            expect(ALWAYS_AVAILABLE.has(pkg) || deps.has(pkg), `${file.path}: ${pkg}`).toBe(true)
          }
        }
      }
    },
  )
})

describe("graphcomp.css", () => {
  const sources = walk(join(root, "registry/graphcomp"))
    .filter((path) => /\.tsx?$/.test(path))
    .map((path) => [path.slice(root.length + 1), readFileSync(path, "utf8")] as const)

  it("defines every --gc-* variable that a component reads", () => {
    for (const [path, source] of sources) {
      for (const [, name] of source.matchAll(/var\(--(gc-[a-z-]+)\)/g)) {
        expect(css, `${path}: --${name}`).toContain(`--${name}:`)
      }
    }
  })

  it("defines a Tailwind theme key for every gc utility that a component uses", () => {
    const pattern =
      /(?<![\w-])(?:bg|text|border|ring|fill|stroke|outline|shadow|rounded(?:-[trbl])?)-(gc(?:-[a-z]+)*)/g
    for (const [path, source] of sources) {
      for (const [utility, token] of source.matchAll(pattern)) {
        const key = utility.startsWith("rounded")
          ? `--radius-${token}`
          : utility.startsWith("shadow")
            ? `--shadow-${token}`
            : `--color-${token}`
        expect(css, `${path}: ${utility}`).toContain(`${key}:`)
      }
    }
  })

  it("defines the same variables in light and dark", () => {
    const block = (selector: string) =>
      css.match(new RegExp(`^${selector.replace(".", "\\.")} \\{([^}]*)\\}`, "m"))?.[1] ?? ""
    const names = (body: string) => [...body.matchAll(/--(gc-[a-z-]+):/g)].map((m) => m[1]).sort()
    const dark = names(block(".dark"))
    expect(dark.length).toBeGreaterThan(0)
    for (const name of dark) expect(names(block(":root"))).toContain(name)
  })
})
