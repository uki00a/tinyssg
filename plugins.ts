import { Config, DidBuildPostContext, Plugin } from "./types.ts";
import { dejs } from "./deps/main.ts";

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

export async function createLayoutPlugin(config: Config): Promise<Plugin> {
  const template = config.templatePath
    ? await Deno.readTextFile(config.templatePath)
    : defaultTemplate;

  async function didBuildPost(ctx: DidBuildPostContext): Promise<void> {
    const { post } = ctx;
    const { body, attributes } = post;
    post.body = await dejs.renderToString(template, {
      ...attributes,
      body,
    });
  }

  const plugin: Plugin = {
    didBuildPost,
  };
  return plugin;
}
