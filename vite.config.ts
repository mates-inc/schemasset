import { fileURLToPath } from "node:url";
import { defineConfig } from "vite-plus";

const ignorePatterns = [
  "**/dist/**",
  "**/node_modules/**",
  "**/.nuxt/**",
  "examples/basic/dynamic-assets/**",
  "packages/nuxt/playground/public-dyn/**",
  "packages/nuxt/playground/tsconfig.json",
];

export default defineConfig({
  resolve: {
    alias: {
      "@schemasset/cli": fileURLToPath(new URL("./packages/cli/src/index.ts", import.meta.url)),
      "@schemasset/core": fileURLToPath(new URL("./packages/core/src/index.ts", import.meta.url)),
      "@schemasset/nuxt": fileURLToPath(new URL("./packages/nuxt/src/index.ts", import.meta.url)),
      "@schemasset/schema": fileURLToPath(
        new URL("./packages/schema/src/index.ts", import.meta.url),
      ),
      "@schemasset/utils": fileURLToPath(new URL("./packages/utils/src/index.ts", import.meta.url)),
    },
  },
  fmt: {
    ignorePatterns,
    semi: true,
    singleQuote: false,
    sortPackageJson: true,
  },
  lint: {
    ignorePatterns,
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  test: {
    include: ["test/**/*.test.ts"],
  },
  run: {
    tasks: {
      check: {
        command: "vp check",
      },
      "check:fix": {
        command: "vp check --fix",
      },
      build: {
        command: "vp run --filter './packages/*' build",
      },
      test: {
        command: "vp test",
      },
      ci: {
        command: "vp run check && vp run test && vp run build",
      },
      "publish:dry": {
        command: "vp run ci && pnpm -r publish --dry-run",
      },
      "publish:all": {
        command: "vp run ci && pnpm -r publish --access public",
      },
      release: {
        command: "vp run build && pnpm -r publish --access public --no-git-checks",
      },
    },
  },
  staged: {
    "*.{js,cjs,mjs,ts,mts,cts,json,jsonc,md,yaml,yml}": "vp check --fix",
  },
});
