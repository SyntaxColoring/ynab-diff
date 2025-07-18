import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // ag-grid is gigantic, so we need to increase the default limit.
    chunkSizeWarningLimit: 1200,
  },
});
