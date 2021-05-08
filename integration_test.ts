import { rootDir, testdataDir } from "./test_util.ts";
import { ensureDir, path } from "./deps/main.ts";
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
    const errorOutput = await readAll(cli.stderr);
    const decoder = new TextDecoder();
    assert(status.success, decoder.decode(errorOutput));

    for (
      const [file, body] of [
        ["index.html", "index"],
        ["2021/01/03.html", "sample2"],
        ["2020/12/28.html", "sample1"],
      ]
    ) {
      const actual = await Deno.readTextFile(
        path.join(simpleConfig.distDir, file),
      );
      assertStringIncludes(
        actual,
        body,
      );
    }
  } finally {
    cli.stderr.close();
    cli.close();
    await emptyDir(simpleConfig.distDir);
  }
});
