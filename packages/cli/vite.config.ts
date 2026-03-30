import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: ["src/index.ts"],
    format: ["esm"],
    platform: "node",
    dts: {
      sourcemap: true,
    },
  },
  run: {
    tasks: {
      build: {
        command: "vp pack",
      },
    },
  },
});
