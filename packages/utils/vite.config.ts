import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    platform: "node",
    target: "es2020",
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
