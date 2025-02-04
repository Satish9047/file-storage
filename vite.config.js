import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: "File Storage App",
        short_name: "FStore",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        // start_url: "/",
        display: "standalone",
        description: "A simple file storage app.",
        icons: [
          {
            src: "icon32.png",
            sizes: "32x32",
            type: "image/png",
          },
          {
            src: "icon64.png",
            sizes: "64x64",
            type: "image/png",
          },
          {
            src: "icon128.png",
            sizes: "128x128",
            type: "image/png",
          },
          {
            src: "icon192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icon512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      screenshots: [
        {
          src: "/screenshot540x720.png",
          sizes: "540x720",
          type: "image/png",
          form_factor: "narrow",
          label: "app narrow screenshot",
        },
        // {
        //   src: "/screenshot/screenshot1080x1920.png",
        //   sizes: "1080x1920",
        //   type: "image/png",
        //   form_factor: "wide", // For mobile screens
        // },
        // {
        //   src: "/screenshot/screenshot2048x2732.png",
        //   sizes: "2048x2732",
        //   type: "image/png",
        //   form_factor: "wide", // For larger screens
        // },
        // {
        //   src: "/screenshot/screenshot1280x800.png",
        //   sizes: "1280x800",
        //   type: "image/png",
        //   // No form_factor means it's used for all screen sizes
        // },
        {
          src: "/screenshot/screenshot640x320.png",
          sizes: "640x320",
          type: "image/png",
          form_factor: "wide",
          label: "app screenshot",
          // No form_factor means it's used for all screen sizes
        },
      ],
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === "document",
            handler: "NetworkFirst",
            options: {
              cacheName: "html-cache",
            },
          },
          {
            urlPattern: ({ request }) =>
              request.destination === "script" ||
              request.destination === "style",
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "static-resources",
            },
          },
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache",
            },
          },
        ],
      },
    }),
  ],
});
