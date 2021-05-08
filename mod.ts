import type { Config } from "./types.ts";
import { Site } from "./site.ts";
import { path } from "./deps/main.ts";
import { createLayoutPlugin } from "./plugins.ts";
import { readConfig } from "./fs.ts";

export type { Config };

async function buildConfig(
  config: Partial<Config> = {},
): Promise<Config> {
  const rootDir = Deno.cwd();
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
    ...(await readConfig(rootDir)),
    ...config,
  };

  finalConfig.plugins = [
    await createLayoutPlugin(finalConfig),
    ...finalConfig.plugins,
  ];

  if (finalConfig.postFiles && finalConfig.postFiles.length > 1) {
    finalConfig.postFiles = finalConfig.postFiles.map((x) => path.resolve(x));
  }
  return finalConfig;
}

export async function build(config: Partial<Config> = {}): Promise<void> {
  return Site.build(await buildConfig(config));
}
