import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Set base to "/audwn-notebook/" for GitHub Pages project site.
// Change to "/" if using a custom domain.
export default defineConfig({
  plugins: [react()],
  base: "/audwn-notebook/",
  build: {
    outDir: "dist",
  },
});
