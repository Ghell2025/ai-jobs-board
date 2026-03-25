import { defineConfig } from "@tanstack/react-start/config";
import tsConfigPaths from "vite-tsconfig-paths";
import netlify from "@netlify/vite-plugin";

export default defineConfig({
  vite: {
    plugins: [
      tsConfigPaths({ projects: ["./tsconfig.json"] }),
      netlify(),
    ],
  },
});
