import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vitest/config";

export default defineConfig(({ command }) => {
  const base = command === "serve" ? "/" : "/hiit/";
  return {
    base,
    plugins: [
      react(),
      VitePWA({
        registerType: "prompt",
        includeAssets: ["ikon.svg", "ikon-192.png", "ikon-512.png", "apple-touch-icon.png"],
        manifest: {
          name: "HIIT",
          short_name: "HIIT",
          description: "Herlig iblant intensiv trening. Streak, morgenfugl og økter du kan dele.",
          lang: "nb",
          start_url: base,
          scope: base,
          display: "standalone",
          orientation: "portrait",
          background_color: "#f4efe6",
          theme_color: "#0f6e66",
          icons: [
            { src: "ikon-192.png", sizes: "192x192", type: "image/png" },
            { src: "ikon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
            { src: "ikon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,svg,png,webmanifest}"],
        },
      }),
    ],
    test: {
      environment: "node",
      include: ["src/**/*.test.ts"],
    },
  };
});
