import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// ✅ No need for tailwindcss plugin here
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
