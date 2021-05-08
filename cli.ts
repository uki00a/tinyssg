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
  const rootDir = Deno.cwd();
  const config = await readConfig(rootDir);
  const defaultConfig: Config = {
    author: "",
    image: "",
    favicon: "",
    postsDir: path.join(rootDir, "posts"),
    distDir: path.join(rootDir, "dist"),
    baseURL: "http://localhost:4507",
    plugins: [],
    logger: console,
  };
  const finalConfig = {
    ...defaultConfig,
    ...config,
  };

  if (finalConfig.plugins.length === 0) {
    finalConfig.plugins.push(await createLayoutPlugin(finalConfig));
  }

  if (files.length > 1) {
    finalConfig.postFiles = files.map((x) => path.resolve(x));
  }

  await build(finalConfig);
}

if (import.meta.main) {
  cli.parse();
}
