import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from "vite-plugin-pwa";


export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "prompt", // Prompt users before applying a new Service Worker
      includeAssets: [
        "favicon.svg",
        "icons.svg",
        "linkedin1.png",
        "linkedin.png",
      ], // Files to cache
      devOptions: {
        enabled: true,
      },
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest,woff2}"],
        navigateFallback: "/index.html",

        runtimeCaching: [
          {
            // Keep page navigations resilient by falling back to a cached app shell.
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "app-pages",
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 7 * 24 * 60 * 60,
              },
              cacheableResponse: {
                statuses: [200],
              },
            },
          },
          {
            // Images are a good candidate for long-lived caching.
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",

            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
              cacheableResponse: {
                statuses: [200],
              },
            },
          },
        ],
      },
      manifest: {
        name: "My First PWA", // Full app name
        short_name: "PWA App", // Short name displayed on home screen
        description: "My first Progressive Web App built with React",
        theme_color: "#0f172a", // Deep slate for browser chrome and installed top bar
        background_color: "#fff8eb", // Warm cream to match the landing screen atmosphere
        display: "standalone", // Makes it look like a native app (hides browser UI)
        start_url: "/",
        orientation: "portrait",
        icons: [
          {
            src: "linkedin1.png", // Small icon
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "linkedin.png", // Large icon
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable", // Works in various environments
          },
        ],
      },
    }),
  ],
});
