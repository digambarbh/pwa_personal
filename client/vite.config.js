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
    globPatterns: ["**/*.{js,css,html,ico,png,svg,jpeg,jpg}"],
  },
  includeAssets: ["favicon.ico", "logo.jpeg"],
  manifest: {
    name: "Prep Insta",
    short_name: "Prep Insta",
    description: "Track your placement prep — roadmap, companies, mock scores, and study time.",
    theme_color: "#bc1888",
    background_color: "#ffffff",
    display: "standalone",
    orientation: "portrait",
    start_url: "/",
    icons: [
      { src: "/logo.jpeg", sizes: "192x192", type: "image/jpeg" },
      { src: "/logo.jpeg", sizes: "512x512", type: "image/jpeg" },
      { src: "/logo.jpeg", sizes: "512x512", type: "image/jpeg", purpose: "maskable" },
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
