import { build, Config } from "./mod.ts";
import { readConfig } from "./fs.ts";
import { cac } from "./deps/cli.ts";
import { path } from "./deps/main.ts";

const cli = cac("tinyssg");

cli.help();
cli.command("build [...files]", "Build files").action((files: string[]) =>
  buildCommand(files)
);

async function buildCommand(files: string[]): Promise<void> {
  const rootDir = Deno.cwd();
  const config = await readConfig(rootDir);
  const defaultConfig: Config = {
    postsDir: path.join(rootDir, "posts"),
    distDir: path.join(rootDir, "dist"),
    baseURL: "http://localhost:4507",
    logger: console,
  };
  const finalConfig = {
    ...defaultConfig,
    ...config,
  };

  if (files.length > 1) {
    finalConfig.postFiles = files.map((x) => path.resolve(x));
  }

  await build(finalConfig);
}

if (import.meta.main) {
  cli.parse();
}
