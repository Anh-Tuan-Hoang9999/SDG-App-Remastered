import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      devOptions: {
        enabled: true,
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      },
      manifest: {
        name: "Trent University SDG",
        short_name: "TrentU SDG",
        description:
          "An app for Trent University students to learn about the United Nation's sustainable development goals",
        theme_color: "#00502F",
        icons: [
          {
            src: "/pwa/128_coloured.png",
            sizes: "128x128",
            type: "image/png",
          },
          {
            src: "/pwa/icon_192_coloured.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa/icon_512_coloured.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
        screenshots: [
          {
            src: "/pwa/temp_mobile_pwa.png",
            sizes: "445x907",
            type: "image/png",
            form_factor: "narrow",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      react: path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Swiper is only used on the Learning screen — keep it isolated
          swiper: ["swiper"],
          // Core React runtime
          "react-vendor": ["react", "react-dom", "react-router"],
          // Animation libraries
          gsap: ["gsap"],
          "framer-motion": ["framer-motion"],
        },
      },
    },
  },
  // No proxy needed — the frontend calls FastAPI directly via axios.
  // The API base URL is configured in .env as VITE_API_BASE_URL.
});
