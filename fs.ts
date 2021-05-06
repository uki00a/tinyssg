import { exists, path } from "./deps.ts";
import type { Config } from "./types.ts";

export async function readConfig(dir: string): Promise<Partial<Config>> {
  const configPath = path.join(dir, "tinyssg.config.ts");
  if (await exists(configPath)) {
    const module = await import(configPath);
    return module?.default;
  } else {
    return {} as Config;
  }
}

export function replaceExtname(fileName: string, newExtname: string): string {
  const extname = path.extname(fileName);
  return fileName.slice(0, -extname.length) + newExtname;
}

export async function collectPostFiles(config: Config): Promise<string[]> {
  const files = [] as Array<string>;
  await iterateFiles(config.postsDir, (dir, entry) => {
    if (".md" !== path.extname(entry.name)) {
      return;
    }
    const fileName = path.join(dir, entry.name);
    files.push(fileName);
  });
  return files.sort();
}

async function iterateFiles(
  dir: string,
  fn: (dir: string, entry: Deno.DirEntry) => Promise<void> | void,
): Promise<void> {
  for await (const entry of Deno.readDir(dir)) {
    if (entry.isDirectory) {
      await iterateFiles(path.join(dir, entry.name), fn);
    } else {
      await fn(dir, entry);
    }
  }
}
