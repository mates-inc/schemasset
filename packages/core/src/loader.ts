import type { SchemaDefFile } from "@schemasset/schema";
import { relative, resolve } from "node:path";
import { glob } from "fast-glob";

export interface LoaderResult {
  baseDir: string;
  pattern: string;
  files: string[];
  optional: boolean;
}

export interface LoaderOptions {
  baseDir: string | string[];
  files: SchemaDefFile[];
}

export async function loadFiles(options: LoaderOptions): Promise<LoaderResult[]> {
  const { baseDir, files } = options;
  const baseDirs = Array.isArray(baseDir) ? baseDir : [baseDir];

  const results = await Promise.all(
    baseDirs.flatMap((currentBaseDir) =>
      files.map(async (file) => {
        const matches = await glob(file.pattern, {
          cwd: currentBaseDir,
          absolute: false,
          dot: true,
        });

        return {
          baseDir: currentBaseDir,
          pattern: file.pattern,
          files: matches.map((filePath) =>
            relative(currentBaseDir, resolve(currentBaseDir, filePath)),
          ),
          optional: file.optional ?? false,
        };
      }),
    ),
  );

  return results;
}
