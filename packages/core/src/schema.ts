import type { SchemaDocument } from "@schemasset/schema";

export interface Schema {
  filename: string;
  filetype: "json" | "yaml";
  schema: SchemaDocument;
}
