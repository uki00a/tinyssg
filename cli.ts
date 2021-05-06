import { build, Config } from "./mod.ts";
import { readConfig } from "./fs.ts";
import { path } from "./deps.ts";

async function main() {
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

  const command = Deno.args[0];
  // FIXME
  if (Deno.args.length > 1) {
    finalConfig.postFiles = [path.resolve(Deno.args[1])];
  }

  switch (command) {
    case "build":
      await build(finalConfig);
      break;
    default:
      throw new Error("Unknown command: " + command);
  }
}

if (import.meta.main) {
  main().catch((error) => {
    console.error(error);
    Deno.exit(1);
  });
}
