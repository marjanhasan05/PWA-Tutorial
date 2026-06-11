import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'icons.svg',
        'pwa-icon.svg',
        'pwa-maskable-icon.svg',
        'pwa-192x192.png',
        'pwa-512x512.png',
        'pwa-maskable-512x512.png',
      ],
      injectRegister: 'auto',
      manifest: {
        name: 'TaskFlow Todo UI',
        short_name: 'TaskFlow',
        description:
          'TaskFlow is an installable task dashboard with offline queueing and sync support.',
        theme_color: '#11141B',
        background_color: '#0F172A',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        orientation: 'portrait',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [
          /^\/(auth|tasks|users|sync)(\/|$)/,
        ],
        runtimeCaching: [
          {
            urlPattern: ({ request, sameOrigin }) =>
              sameOrigin &&
              ['style', 'script', 'worker'].includes(request.destination),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'app-shell-resources',
            },
          },
          {
            urlPattern: ({ request, sameOrigin }) =>
              sameOrigin && request.destination === 'image',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'app-image-assets',
              expiration: {
                maxEntries: 32,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
});
