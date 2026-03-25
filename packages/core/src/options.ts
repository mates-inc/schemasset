export interface ParserOptions {
  /**
   * detect `schemasset.json` `schemasset.yaml` or `schemasset.yml` file in the current directory
   */
  schemaFile?: string;

  /**
   * Base directory used to resolve `schemaFile` and default schema discovery.
   */
  cwd?: string;
}
