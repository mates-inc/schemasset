import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { logger } from "@schemasset/utils";
import { describe, expect, it } from "vite-plus/test";
import { runCheckCommand } from "../packages/cli/src/commands/check.js";

const ROOT_DIR = resolve(fileURLToPath(new URL("..", import.meta.url)));

describe("cli", () => {
  it("prints directory-scoped diagnostics for multi-target schemas", async () => {
    logger.setColors(false);

    const { result, stderr } = await captureOutput(async () => {
      return await runCheckCommand({
        cwd: resolve(ROOT_DIR, "examples/multi-target"),
        config: "schemasset.json",
      });
    });

    expect(stderr.trim().split("\n")).toEqual([
      'ERROR: [dynamic-assets-a] [SUBDIR_MISSING_PATTERN] Required pattern "*/favicon.ico" is missing in subdirectory "domain-b"',
      'ERROR: [dynamic-assets-b] [SUBDIR_MISSING_PATTERN] Required pattern "*/logo.png" is missing in subdirectory "domain-d"',
    ]);
    expect(result.hasError).toBe(true);
  });
});

async function captureOutput<T>(callback: () => Promise<T>): Promise<{
  result: T;
  stdout: string;
  stderr: string;
}> {
  const stdout: string[] = [];
  const stderr: string[] = [];
  const originalStdout = process.stdout.write.bind(process.stdout);
  const originalStderr = process.stderr.write.bind(process.stderr);

  process.stdout.write = ((chunk: string | Uint8Array) => {
    stdout.push(String(chunk));
    return true;
  }) as typeof process.stdout.write;

  process.stderr.write = ((chunk: string | Uint8Array) => {
    stderr.push(String(chunk));
    return true;
  }) as typeof process.stderr.write;

  try {
    const result = await callback();
    return {
      result,
      stdout: stdout.join(""),
      stderr: stderr.join(""),
    };
  } finally {
    process.stdout.write = originalStdout;
    process.stderr.write = originalStderr;
  }
}
