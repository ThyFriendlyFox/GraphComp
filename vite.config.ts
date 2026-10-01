/// <reference types="vitest/config" />
import { fileURLToPath, URL } from "node:url"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"

import { seo } from "./scripts/seo"

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss(), seo()],
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
