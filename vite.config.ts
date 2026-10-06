/// <reference types="vitest/config" />
import { fileURLToPath, URL } from "node:url"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig, type Plugin } from "vite"

import { seo } from "./scripts/seo"

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url))

// The built site serves the <gc-flow-canvas> bundle at /wc/graphcomp.js
// (wc/vite.config.ts). The dev server serves the source at the same URL, so
// wc/example.html works unchanged in both.
function webComponentsDev(): Plugin {
  return {
    name: "graphcomp-wc-dev",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url?.split("?")[0] === "/wc/graphcomp.js") req.url = "/wc/graphcomp.tsx"
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), seo(), webComponentsDev()],
  base: process.env.GRAPHCOMP_BASE ?? "/",
  resolve: {
    // Mirrors tsconfig.app.json paths. Registry files import through these
    // aliases so the shadcn CLI can rewrite them for the consumer's project.
    alias: [
      { find: /^@\/registry\//, replacement: r("./registry/") },
      { find: /^@\/lib\//, replacement: r("./registry/graphcomp/lib/") },
    ],
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      // The docs site is the root page; the playground lives at /playground/.
      input: { site: r("./index.html"), playground: r("./playground/index.html") },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.test.{ts,tsx}"],
    setupFiles: ["tests/setup.ts"],
  },
})
