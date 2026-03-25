import { basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { check, loadFiles, parse } from "@schemasset/core";
import { describe, expect, it } from "vite-plus/test";

const ROOT_DIR = resolve(fileURLToPath(new URL("..", import.meta.url)));

describe("schema validation", () => {
  it("reports missing files for the basic example", async () => {
    const parsed = parse({
      schemaFile: resolve(ROOT_DIR, "examples/basic/schemasset.json"),
    });
    const schema = Array.isArray(parsed.schema) ? parsed.schema[0] : parsed.schema;

    const results = await loadFiles({
      baseDir: schema.targetDir,
      files: schema.files,
    });
    const validation = check({ results });

    expect(validation.diagnostics).toEqual([
      {
        severity: "error",
        baseDir: resolve(ROOT_DIR, "examples/basic/dynamic-assets"),
        pattern: "*/favicon.ico",
        code: "SUBDIR_MISSING_PATTERN",
        subdir: "domain-b",
        message: 'Required pattern "*/favicon.ico" is missing in subdirectory "domain-b"',
      },
      {
        severity: "error",
        baseDir: resolve(ROOT_DIR, "examples/basic/dynamic-assets"),
        pattern: "*/og-image.png",
        code: "SUBDIR_MISSING_PATTERN",
        subdir: "domain-c",
        message: 'Required pattern "*/og-image.png" is missing in subdirectory "domain-c"',
      },
    ]);
  });

  it("supports checking multiple target directories in one schema", async () => {
    const parsed = parse({
      schemaFile: resolve(ROOT_DIR, "examples/multi-target/schemasset.json"),
    });
    const schema = Array.isArray(parsed.schema) ? parsed.schema[0] : parsed.schema;

    const results = await loadFiles({
      baseDir: schema.targetDir,
      files: schema.files,
    });
    const validation = check({ results });

    expect(
      validation.diagnostics.map((diagnostic) => ({
        ...diagnostic,
        baseDir: basename(diagnostic.baseDir),
      })),
    ).toEqual([
      {
        severity: "error",
        baseDir: "dynamic-assets-a",
        pattern: "*/favicon.ico",
        code: "SUBDIR_MISSING_PATTERN",
        subdir: "domain-b",
        message: 'Required pattern "*/favicon.ico" is missing in subdirectory "domain-b"',
      },
      {
        severity: "error",
        baseDir: "dynamic-assets-b",
        pattern: "*/logo.png",
        code: "SUBDIR_MISSING_PATTERN",
        subdir: "domain-d",
        message: 'Required pattern "*/logo.png" is missing in subdirectory "domain-d"',
      },
    ]);
  });
});
