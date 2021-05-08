export interface Config {
  favicon?: string;
  author?: string;
  image?: string;
  postsDir: string;
  distDir: string;
  templatePath?: string;
  baseURL: string;
  logger: Logger;
  plugins: Plugin[];
  postFiles?: string[];
}

export interface Logger {
  info(msg: string): void;
}

export interface Post {
  attributes: PostAttributes;
  body: string;
  path: string;
}

export interface DidBuildPostContext {
  post: Post;
  config: Config;
}

export interface Plugin {
  didBuildPost(ctx: DidBuildPostContext): Promise<void> | void;
}

export interface PostAttributes {
  title: string;
  type: string;
  description: string;
  image: string;
}
