import type { Config } from "./types.ts";
import { Site } from "./site.ts";

export type { Config };

export function build(config: Config): Promise<void> {
  return Site.build(config);
}
