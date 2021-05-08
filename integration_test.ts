import { rootDir, testdataDir } from "./test_util.ts";
import { ensureDir, path } from "./deps/main.ts";
import { htmlParser } from "./deps/html-parser.ts";
import { assert, assertStringIncludes, emptyDir, readAll } from "./deps/dev.ts";
import simpleConfig from "./testdata/simple/tinyssg.config.ts";

Deno.test("tinyssg build", async () => {
  await ensureDir(simpleConfig.distDir);
  const cli = Deno.run({
    cwd: testdataDir("simple"),
    cmd: [
      Deno.execPath(),
      "run",
      "--allow-read",
      "--allow-write",
      "--allow-env", // TODO: Specify permissions more strictly.
      rootDir("cli.ts"),
      "build",
    ],
    stderr: "piped",
  });
  try {
    const status = await cli.status();
    const decoder = new TextDecoder();
    const errorOutput = decoder.decode(await readAll(cli.stderr));
    assert(status.success, errorOutput);

    for (
      const { file, body, title } of [
        { file: "index.html", body: "index", title: "Index page" },
        { file: "2021/01/03.html", body: "sample2", title: "sample2" },
        { file: "2020/12/28.html", body: "sample1", title: "sample1" },
      ]
    ) {
      const actualHTML = await Deno.readTextFile(
        path.join(simpleConfig.distDir, file),
      );
      assertStringIncludes(
        actualHTML,
        body,
      );
      // deno-lint-ignore no-explicit-any
      const doc = (htmlParser as any).parse(actualHTML);
      assertStringIncludes(
        doc.querySelector("title").innerText,
        title,
      );
    }
  } finally {
    cli.stderr.close();
    cli.close();
    await emptyDir(simpleConfig.distDir);
  }
});
