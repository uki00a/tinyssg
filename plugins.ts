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
    <% if (image) { %>
    <meta property="og:image" content="<%= image %>" />
    <% } %>
    <meta name="twitter:card" content="summary" />
    <% if (author) { %>
    <meta name="twitter:site" content="@<%= author %>" />
    <meta name="twitter:creator" content="@<%= author %>" />
    <% } %>
    <% if (favicon) { %>
    <link rel="icon" href="<%= favicon %>"></link>
    <% } %>
  </head>
  <body>
  </body>
</html>`;

export async function createLayoutPlugin(config: Config): Promise<Plugin> {
  const template = config.templatePath
    ? await Deno.readTextFile(config.templatePath)
    : defaultTemplate;

  async function didBuildPost(ctx: DidBuildPostContext): Promise<void> {
    const { post, config } = ctx;
    const { body, attributes } = post;
    const { favicon, image, author } = config;
    post.body = await dejs.renderToString(template, {
      ...attributes,
      favicon,
      image,
      author,
      body,
    });
  }

  const plugin: Plugin = {
    didBuildPost,
  };
  return plugin;
}
