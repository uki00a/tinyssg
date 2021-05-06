export interface Config {
  postsDir: string;
  distDir: string;
  templatePath?: string;
  baseURL: string;
  logger: Logger;
  postFiles?: string[];
}

export interface Logger {
  info(msg: string): void;
}

export interface Page {
  path: string;
  title: string;
  description: string;
  contents: string;
  type: string;
}

export interface Post extends Page {
  id: number;
  publishedAt?: Date | null;
  summary?: string;
}
