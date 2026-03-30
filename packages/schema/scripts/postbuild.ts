import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { toJsonSchema } from "@valibot/to-json-schema";
import { schemaDocumentDef } from "@schemasset/schema";

const __dirname = new URL(".", import.meta.url).pathname;
const out = resolve(__dirname, "../dist/schema.json");

const jsonSchema = toJsonSchema(schemaDocumentDef);
const jsonSchemaFile = JSON.stringify(jsonSchema, null, 2);
writeFileSync(out, jsonSchemaFile);
