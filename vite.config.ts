import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
  },
  server:
    command === "serve"
      ? {
          proxy: {
            "/api": {
              target: "https://stockify-backend-gwaa.onrender.com",
              changeOrigin: true,
              secure: false,
            },
          },
        }
      : undefined,
}))
