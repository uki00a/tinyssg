import { dejs, ensureDir, frontMatter, marked, path } from "./deps/main.ts";
import type { Config, Page, Post } from "./types.ts";
export type { Config, Logger } from "./types.ts";
import { collectPostFiles, replaceExtname } from "./fs.ts";

// FIXME!
const defaultTemplate = `<html>
  <head>
    <title><%= title %></title>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1.0" />
    <meta name="description" content="<%= description %>" />
    <meta property="og:title" content="<%= title %>" />
    <meta property="og:description" content="<%= description %>" />
    <meta property="og:type" content="<%= type %>" />
    <!-- FIXME! -->
    <!--
    <meta property="og:image" content="https://raw.githubusercontent.com/uki00a/blog/master/src/assets/avatar.png" />
    -->
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:site" content="@uki00a" />
    <meta name="twitter:creator" content="@uki00a" />
    <!--
    <link rel="icon" href="https://raw.githubusercontent.com/uki00a/blog/master/src/assets/favicon.ico"></link>
    -->
  </head>
  <body>
  </body>
</html>`;

export class Site {
  constructor(
    readonly config: Config,
    readonly template: string,
  ) {}

  static async build(config: Config): Promise<void> {
    const template = config.templatePath
      ? await Deno.readTextFile(config.templatePath)
      : defaultTemplate;
    const site = new Site(config, template);
    return site.build();
  }

  async build(): Promise<void> {
    const postFiles = this.config.postFiles ??
      await collectPostFiles(this.config);
    const posts = await Promise.all(
      postFiles.map((file) => this.createPost(file)),
    );
    for (const post of posts) {
      await this.writePage(post);
      this.config.logger.info(`[info] Generated ${post.path}`);
    }
  }

  private async createPost(postFile: string): Promise<Post> {
    const src = await Deno.readTextFile(postFile);
    const { attributes, body } = frontMatter(src);
    const {
      id,
      title = path.basename(postFile),
      description = title,
      type = "post",
      publishedAt,
      summary = "",
    } = attributes as Partial<Post>;

    validatePost(attributes as Post);

    const bodyHTML = marked(body);
    const titleHTML = `<h1>#${id} ${title}</h1>`;
    const html = `${titleHTML}\n${bodyHTML}`;

    return {
      id: Number(id),
      path: replaceExtname(
        path.relative(this.config.postsDir, postFile),
        ".html",
      ),
      contents: html,
      description,
      title: `${title}`,
      summary,
      publishedAt: publishedAt ? new Date(publishedAt) : null,
      type,
    };
  }

  private async writePage(page: Page): Promise<void> {
    await this.write(page.path, await this.generateHTML(page));
  }

  private async write(
    filename: string,
    contents: string,
  ): Promise<void> {
    const distFilename = path.join(this.config.distDir, filename);
    await ensureDir(path.dirname(distFilename));
    await Deno.writeTextFile(distFilename, contents);
  }

  private generateHTML(page: Page): Promise<string> {
    return dejs.renderToString(this.template, {
      ...page,
      home: this.config.baseURL,
    });
  }
}

function validatePost(post: Partial<Post>): void {
  const {
    id,
    title,
    publishedAt,
  } = post;

  if (id == null) {
    throw new Error(title + ': "id" is missing');
  }

  if (title == null) {
    throw new Error(`Post ${id}: "title" is missing`);
  }

  if (publishedAt == null) {
    throw new Error(`Post ${id}: "publishedAt" is missing`);
  }
}
