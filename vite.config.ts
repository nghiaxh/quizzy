/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["app-icon.svg"],
      manifest: {
        name: "Quizzy",
        short_name: "Quizzy",
        description: "Ôn tập trắc nghiệm",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        scope: "./",
        start_url: "./",
        icons: [
          {
            src: "app-icon.svg",
            sizes: "192x192",
            type: "image/svg+xml",
          },
          {
            src: "app-icon.svg",
            sizes: "512x512",
            type: "image/svg+xml",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,mp3,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "external",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 7 * 24 * 60 * 60,
              },
            },
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/framer-motion")) return "framer-motion";
          if (id.includes("node_modules/@heroui") || id.includes("node_modules/react-aria-components") || id.includes("node_modules/react-stately") || id.includes("node_modules/@react-aria") || id.includes("node_modules/@react-stately") || id.includes("node_modules/@react-types") || id.includes("node_modules/@react-spectrum") || id.includes("node_modules/react-aria")) return "heroui";
          if (id.includes("node_modules/@phosphor-icons")) return "phosphor-icons";
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test-setup.ts",
    css: true,
    clearMocks: true,
  },
});
