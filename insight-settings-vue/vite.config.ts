import {defineConfig} from "vite";
import vue from "@vitejs/plugin-vue";

// The build replaces the app's settings folder. Static files (insight icons) come from public/.
export default defineConfig({
  base: "./",
  plugins: [vue()],
  build: {
    outDir: "../settings",
    emptyOutDir: true
  }
});
