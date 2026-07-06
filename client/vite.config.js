import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from 'vite-plugin-pwa'
export default defineConfig({
  plugins: [react(),VitePWA({
  strategies: "injectManifest",
  srcDir: "src",
  filename: "sw.js",
  registerType: "autoUpdate",
  devOptions: { enabled: true, type: "module" },
  injectManifest: {
    globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
  },
  includeAssets: ["favicon.ico", "apple-touch-icon.png"],
  manifest: {
    name: "Placement Tracker",
    short_name: "Tracker",
    description: "Track your placement prep — roadmap, companies, mock scores, and study time.",
    theme_color: "#1c2e22",
    background_color: "#1c2e22",
    display: "standalone",
    orientation: "portrait",
    start_url: "/",
    icons: [
      { src: "/pwa-192.png", sizes: "192x192", type: "image/png" },
      { src: "/pwa-512.png", sizes: "512x512", type: "image/png" },
      { src: "/pwa-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  },
})],
 server: {
  port: 5173,
  proxy: {
    "/api": {
      target: "http://localhost:5000",
      changeOrigin: true,
    },
  },
  allowedHosts: ["blighted-limb-wooing.ngrok-free.dev"],
},
});
