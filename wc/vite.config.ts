import { readFileSync } from "node:fs"
import { fileURLToPath, URL } from "node:url"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url))

// Builds <gc-flow-canvas> into one ES module with React, React Flow, Motion
// and the stylesheet inside: dist/wc/graphcomp.js, served at /wc/graphcomp.js.
// It runs after the site build, so it must not empty dist/.
export default defineConfig({
  root: r("."),
  publicDir: false,
  plugins: [
    react(),
    tailwindcss(),
    {
      // The example page is plain HTML. It ships as written, unbundled.
      name: "graphcomp-wc-example",
      generateBundle() {
        this.emitFile({
          type: "asset",
          fileName: "example.html",
          source: readFileSync(r("./example.html"), "utf8"),
        })
      },
    },
  ],
  resolve: {
    alias: [
      { find: /^@\/registry\//, replacement: r("../registry/") },
      { find: /^@\/lib\//, replacement: r("../registry/graphcomp/lib/") },
    ],
  },
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
  build: {
    outDir: r("../dist/wc"),
    emptyOutDir: false,
    // Library mode keeps ES output unminified for bundlers. This file goes
    // straight to the browser, so minify it fully.
    rolldownOptions: { output: { minify: true } },
    lib: {
      entry: r("./graphcomp.tsx"),
      formats: ["es"],
      fileName: () => "graphcomp.js",
    },
  },
})
