import { build, Config } from "./mod.ts";
import { readConfig } from "./fs.ts";
import { cac } from "./deps/cli.ts";
import { path } from "./deps/main.ts";
import { createLayoutPlugin } from "./plugins.ts";

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
