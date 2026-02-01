import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-charts": ["recharts"],
          "vendor-map": ["mapbox-gl"],
        },
      },
    },
    cssCodeSplit: true,
    sourcemap: false,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "pwa-icons/*.png"],
      manifest: {
        name: "ZIVO",
        short_name: "ZIVO",
        description: "Search flights, hotels, car rentals. Request rides and food delivery.",
        theme_color: "#0F172A",
        background_color: "#0F172A",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        id: "com.zivo.app",
        icons: [
          {
            src: "/pwa-icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/pwa-icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable"
          },
          {
            src: "/pwa-icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/pwa-icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ],
        categories: ["travel", "transportation", "food", "lifestyle"],
        shortcuts: [
          {
            name: "Search Flights",
            short_name: "Flights",
            url: "/travel?tab=flights",
            icons: [{ src: "/pwa-icons/icon-192x192.png", sizes: "192x192" }]
          },
          {
            name: "Request Ride",
            short_name: "Rides",
            url: "/rides",
            icons: [{ src: "/pwa-icons/icon-192x192.png", sizes: "192x192" }]
          },
          {
            name: "Order Food",
            short_name: "Eats",
            url: "/eats",
            icons: [{ src: "/pwa-icons/icon-192x192.png", sizes: "192x192" }]
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.mapbox\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "mapbox-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "google-fonts-stylesheets"
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          },
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "unsplash-images",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\.(jpg|jpeg|png|webp|avif)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "local-images",
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
