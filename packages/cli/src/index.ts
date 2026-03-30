#!/usr/bin/env node
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { cli, define } from "gunshi";
import { check } from "./commands/check.js";

export const main = define({
  entry: true,
  name: "schemasset",
  description: "Asset management with schema validation",
  subCommands: {
    check,
  },
});

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const output = await cli(process.argv.slice(2), main);
  if (output) {
    process.stdout.write(`${output}\n`);
  }
}

export default main;
