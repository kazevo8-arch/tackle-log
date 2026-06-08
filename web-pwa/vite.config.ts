import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Fishing Log Web/PWA",
        short_name: "Fishing Log",
        description: "釣れたセット、ルアー、ポイントを再利用する個人用釣り実績ログ",
        theme_color: "#284635",
        background_color: "#efe6cf",
        display: "standalone",
        orientation: "portrait",
        start_url: ".",
        scope: ".",
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
      },
    }),
  ],
});
