import { defineConfig } from "vite-plus";

export default defineConfig({
  run: {
    tasks: {
      build: {
        command: "nuxt-module-build build",
      },
    },
  },
});
