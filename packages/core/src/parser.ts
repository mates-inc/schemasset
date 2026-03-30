import type { ParserOptions } from "./options";
import type { Schema } from "./schema";
import type { SchemaDef } from "@schemasset/schema";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { cwd } from "node:process";

import * as v from "valibot";
import { schemaDocumentDef } from "@schemasset/schema";
import { load } from "js-yaml";
import { SchemaError } from "./error";
import { findSchemaFile } from "./finder";

export function parse(options?: ParserOptions): Schema {
  const searchDir = resolve(options?.cwd ?? cwd());
  const schemaPath = options?.schemaFile
    ? resolve(searchDir, options.schemaFile)
    : findSchemaFile({ cwd: searchDir });
  if (!schemaPath) {
    throw new SchemaError("Schema file not found in current directory", {
      code: "FILE_NOT_FOUND",
    });
  }

  let content: string;
  try {
    content = readFileSync(schemaPath, "utf-8");
  } catch (e) {
    throw new SchemaError(
      `Failed to read schema file: ${e instanceof Error ? e.message : String(e)}`,
      { code: "FILE_NOT_FOUND", cause: e },
    );
  }

  const filetype = schemaPath.endsWith(".json") ? "json" : "yaml";
  let parsedContent;
  try {
    parsedContent = filetype === "json" ? JSON.parse(content) : load(content);
  } catch (e) {
    throw new SchemaError(
      `Failed to parse ${filetype} content: ${e instanceof Error ? e.message : String(e)}`,
      { code: "PARSE_ERROR", cause: e },
    );
  }

  const validationResult = v.safeParse(schemaDocumentDef, parsedContent);
  if (!validationResult.success) {
    throw new SchemaError(`Invalid schema: ${v.summarize(validationResult.issues)}`, {
      code: "VALIDATION_ERROR",
      cause: validationResult.issues,
    });
  }

  const schemaDocument = validationResult.output;
  const schemaDir = dirname(schemaPath);
  const resolvedSchema = Array.isArray(schemaDocument)
    ? schemaDocument.map((schema) => resolveSchemaDef(schema, schemaDir))
    : resolveSchemaDef(schemaDocument, schemaDir);

  return {
    filename: schemaPath,
    filetype,
    schema: resolvedSchema,
  };
}

function resolveSchemaDef(schema: SchemaDef, schemaDir: string): SchemaDef {
  return {
    ...schema,
    targetDir: resolveTargetDir(schema.targetDir, schemaDir),
  };
}

function resolveTargetDir(targetDir: SchemaDef["targetDir"], schemaDir: string): string | string[] {
  return Array.isArray(targetDir)
    ? targetDir.map((currentTargetDir) => resolve(schemaDir, currentTargetDir))
    : resolve(schemaDir, targetDir);
}
