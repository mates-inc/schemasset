<div align="center">

  <img src="https://github.com/mates-inc/schemasset/blob/main/assets/schemasset.png?raw=true" alt="schemasset logo" height="150" width="150">

# schemasset

A schema-based tool for asset file validation.

</div>

> [!TIP]
> The name "schemasset" is derived from "schemed asset", referring to assets that are validated against a defined schema.

## Motivation

Managing asset files across multiple domains, brands, or projects gets messy quickly.

- Required assets need to exist in every subdirectory.
- Some assets are optional, but when they exist they still need to follow a pattern.
- Different asset roots often need to be checked in one pass.

`schemasset` turns those rules into a portable schema and checks them from the CLI or from code.

## Installation

```bash
pnpm add -D @schemasset/cli
```

## Usage

Create a `schemasset.json` or `schemasset.yaml` in your project.

```json
{
  "$schema": "node_modules/@schemasset/schema/dist/schema.json",
  "targetDir": "./dynamic-assets",
  "files": [
    { "pattern": "*/logo.png" },
    { "pattern": "*/header-logo.png", "optional": true },
    { "pattern": "*/favicon.ico" },
    { "pattern": "*/og-image.png" }
  ]
}
```

Then run:

```bash
pnpm dlx schemasset check --config ./schemasset.json
```

Or, if the schema file is in the current directory:

```bash
pnpm dlx schemasset check
```

### CLI Options

| Option     | Alias | Description                                                    |
| ---------- | ----- | -------------------------------------------------------------- |
| `--config` | `-c`  | Path to the schema file                                        |
| `--cwd`    | `-d`  | Working directory used for schema discovery and relative paths |

## Multiple Directories

If the same file rules should be applied to multiple asset roots, `targetDir` can be an array.

```json
{
  "$schema": "node_modules/@schemasset/schema/dist/schema.json",
  "targetDir": ["./dynamic-assets-a", "./dynamic-assets-b"],
  "files": [{ "pattern": "*/logo.png" }, { "pattern": "*/favicon.ico" }]
}
```

If each directory needs a different rule set, the document itself can be an array of schema definitions.

```json
[
  {
    "targetDir": "./dynamic-assets-a",
    "files": [{ "pattern": "*/logo.png" }]
  },
  {
    "targetDir": "./dynamic-assets-b",
    "files": [{ "pattern": "*/favicon.ico" }]
  }
]
```

## API

```ts
interface SchemaDef {
  $schema?: string;
  targetDir: string | string[];
  files: SchemaDefFile[];
}

type SchemaDocument = SchemaDef | SchemaDef[];

interface SchemaDefFile {
  pattern: string;
  optional?: boolean;
}
```

Programmatic usage:

```ts
import { check, loadFiles, parse } from "@schemasset/core";

const parsed = parse({
  schemaFile: "./schemasset.json",
});

const definitions = Array.isArray(parsed.schema) ? parsed.schema : [parsed.schema];
const results = (
  await Promise.all(
    definitions.map((definition) =>
      loadFiles({
        baseDir: definition.targetDir,
        files: definition.files,
      }),
    ),
  )
).flat();

const { diagnostics, hasError } = check({ results });

for (const diagnostic of diagnostics) {
  console.log(`[${diagnostic.code}] ${diagnostic.message}`);
}

if (hasError) {
  process.exitCode = 1;
}
```

## Integrations

### Nuxt Module

`@schemasset/nuxt` integrates asset validation into Nuxt builds.

Current note:
The Nuxt module currently expects a single schema definition with a single `targetDir`.

[Read more about the Nuxt module](./packages/nuxt/README.md)

## Development

This repository uses:

- Node `24.14.0`
- `pnpm`
- `Vite+`

Common commands:

```bash
vp install
vp run check
vp run test
vp run build
```
