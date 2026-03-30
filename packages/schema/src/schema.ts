import * as v from "valibot";

export type SchemaDef = v.InferOutput<typeof schemaDef>;

export type SchemaDocument = v.InferOutput<typeof schemaDocumentDef>;

export type SchemaDefFile = v.InferOutput<typeof schemaDefFile>;

export const schemaDefFile = v.strictObject({
  pattern: v.pipe(v.string(), v.minLength(1, "Pattern must not be empty")),
  optional: v.optional(v.boolean()),
});

export const targetDirDef = v.union([
  v.pipe(v.string(), v.minLength(1, "Target directory must not be empty")),
  v.pipe(
    v.array(v.pipe(v.string(), v.minLength(1, "Target directory must not be empty"))),
    v.minLength(1, "At least one target directory must be specified"),
  ),
]);

export const schemaDef = v.strictObject({
  $schema: v.optional(v.string()),
  targetDir: targetDirDef,
  files: v.pipe(
    v.array(schemaDefFile),
    v.minLength(1, "At least one file pattern must be specified"),
  ),
});

export const schemaDocumentDef = v.union([
  schemaDef,
  v.pipe(v.array(schemaDef), v.minLength(1, "At least one schema definition must be specified")),
]);
