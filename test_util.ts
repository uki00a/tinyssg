import { path } from "./deps.ts";

export function rootDir(p = "/"): string {
  const rootDir = path.dirname(path.fromFileUrl(import.meta.url));
  return path.join(rootDir, p);
}

export function distDir(p = "/"): string {
  return path.join(rootDir("dist"), p);
}

export function testdataDir(p = "/"): string {
  return path.join(rootDir("testdata"), p);
}
