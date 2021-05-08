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
    const postFiles = this.config.postFiles ??
      await collectPostFiles(this.config);
    const posts = await Promise.all(
      postFiles.map((file) => this.createPost(file)),
    );
    for (const post of posts) {
      await this.writePost(post);
      this.config.logger.info(`[info] Generated ${post.path}`);
    }
  }

  private async createPost(postFile: string): Promise<Post> {
    const src = await Deno.readTextFile(postFile);
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
