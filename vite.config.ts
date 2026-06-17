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
        globPatterns: ["**/*.{js,css,html,png,svg,mp3}"],
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
  test: {
    environment: "jsdom",
    setupFiles: "./src/test-setup.ts",
    css: true,
    clearMocks: true,
  },
});
