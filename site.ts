import { ensureDir, frontMatter, marked, path } from "./deps/main.ts";
import type { Config, Post, PostAttributes } from "./types.ts";
export type { Config, Logger } from "./types.ts";
import { collectPostFiles, replaceExtname } from "./fs.ts";

export class Site {
  constructor(
    readonly config: Config,
  ) {}

  static build(config: Config): Promise<void> {
    const site = new Site(config);
    return site.build();
  }

  async build(): Promise<void> {
    const postFiles = await this.collectPostFiles();
    const posts = await Promise.all(
      postFiles.map((file) => this.buildPost(file)),
    );
    for (const post of posts) {
      await this.writePost(post);
      this.config.logger.info(`[info] Generated ${post.path}`);
    }
  }

  private async collectPostFiles(): Promise<string[]> {
    if (this.config.postFiles && this.config.postFiles.length > 0) {
      return this.config.postFiles;
    }
    const postFiles = await collectPostFiles(this.config);
    return postFiles;
  }

  private async buildPost(postFile: string): Promise<Post> {
    const src = await Deno.readTextFile(postFile);
    const stat = await Deno.lstat(postFile);
    const { attributes, body } = frontMatter(src);
    const defaultTitle = path.basename(postFile);
    const post: Post = {
      body: marked(body),
      attributes: {
        title: defaultTitle,
        type: "article",
        description: defaultTitle,
        image: "",
        ...(attributes as Partial<PostAttributes>),
      },
      createdAt: stat.birthtime ?? undefined,
      path: replaceExtname(
        path.relative(this.config.postsDir, postFile),
        ".html",
      ),
    };

    const ctx = { config: this.config, post };
    for (const plugin of this.config.plugins) {
      await plugin.didBuildPost(ctx);
    }

    return post;
  }

  private async writePost(post: Post): Promise<void> {
    await this.write(post.path, post.body);
  }

  private async write(
    filename: string,
    contents: string,
  ): Promise<void> {
    const distFilename = path.join(this.config.distDir, filename);
    await ensureDir(path.dirname(distFilename));
    await Deno.writeTextFile(distFilename, contents);
  }
}
