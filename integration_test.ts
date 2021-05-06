import { rootDir, testdataDir } from "./test_util.ts";
import { ensureDir, exists, path } from "./deps.ts";
import { assert, emptyDir, readAll } from "./test_deps.ts";
import simpleConfig from "./testdata/simple/tinyssg.config.ts";

Deno.test("tinyssg generate", async () => {
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
      const file of [
        "index.html",
        "2021/01/03.html",
        "2020/12/28.html",
      ]
    ) {
      assert(
        await exists(path.join(simpleConfig.distDir, file)),
        `${file} should be created`,
      );
    }
  } finally {
    cli.stderr.close();
    cli.close();
    await emptyDir(simpleConfig.distDir);
  }
});
