import { build } from "./mod.ts";
import { cac } from "./deps/cli.ts";

const cli = cac("tinyssg");

cli.help();
cli.command("build [...files]", "Build files").action((files: string[]) =>
  buildCommand(files)
);

async function buildCommand(files: string[]): Promise<void> {
  await build({ postFiles: files });
}

if (import.meta.main) {
  cli.parse();
}
