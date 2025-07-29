import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // server: {
  //   host: true, // allow external access (mobile)
  //   proxy: {
  //     "/api": {
  //       target: "http://localhost:3000", // local backend
  //       changeOrigin: true,
  //     },
  //   },
  //   allowedHosts: [
  //     "3bf9e7c82234.ngrok-free.app", // optional (for Vite v5+)
  //   ],
  // },
});
