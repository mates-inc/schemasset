import { relative, resolve } from "node:path";
import type { Diagnostic } from "@schemasset/core";
import { check as checkFiles, loadFiles, parse } from "@schemasset/core";
import { logger } from "@schemasset/utils";
import { define } from "gunshi";

export interface CheckCommandOptions {
  config?: string;
  cwd?: string;
}

export interface CheckCommandResult {
  diagnostics: Diagnostic[];
  hasError: boolean;
  errorMessage?: string;
}

export const check = define({
  name: "check",
  description: "Check assets based on schema definitions",
  args: {
    config: {
      type: "string",
      short: "c",
      description: "Path to the schema config file",
    },
    cwd: {
      type: "string",
      short: "d",
      description: "Working directory",
    },
  },
  async run(ctx) {
    const result = await runCheckCommand({
      config: ctx.values.config,
      cwd: ctx.values.cwd,
    });

    if (result.hasError) {
      process.exitCode = 1;
    }
  },
});

export async function runCheckCommand(args: CheckCommandOptions = {}): Promise<CheckCommandResult> {
  try {
    const schema = parse({
      schemaFile: args.config,
      cwd: args.cwd,
    });

    const schemaDefinitions = Array.isArray(schema.schema) ? schema.schema : [schema.schema];
    const results = (
      await Promise.all(
        schemaDefinitions.map((targetSchema) =>
          loadFiles({
            baseDir: targetSchema.targetDir,
            files: targetSchema.files,
          }),
        ),
      )
    ).flat();

    const { diagnostics, hasError } = checkFiles({ results });
    const workingDir = resolve(args.cwd ?? process.cwd());
    const scopedBaseDirs = new Set(diagnostics.map((diagnostic) => diagnostic.baseDir));

    for (const diagnostic of diagnostics) {
      const baseDirPrefix =
        scopedBaseDirs.size > 1 ? `[${formatBaseDir(diagnostic.baseDir, workingDir)}] ` : "";

      if (diagnostic.severity === "error") {
        logger.error(`${baseDirPrefix}[${diagnostic.code}] ${diagnostic.message}`);
      } else {
        logger.warn(`${baseDirPrefix}[${diagnostic.code}] ${diagnostic.message}`);
      }
    }

    return { diagnostics, hasError };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(errorMessage);
    return {
      diagnostics: [],
      hasError: true,
      errorMessage,
    };
  }
}

function formatBaseDir(baseDir: string, workingDir: string): string {
  const relativePath = relative(workingDir, baseDir);
  return relativePath === "" ? "." : relativePath;
}
