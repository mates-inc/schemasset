import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: ["src/index.ts"],
    format: ["esm"],
    dts: {
      sourcemap: true,
    },
  },
  run: {
    tasks: {
      build: {
        command: "vp pack && node scripts/postbuild.ts",
      },
    },
  },
});
