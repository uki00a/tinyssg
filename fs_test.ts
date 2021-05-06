import { collectPostFiles, replaceExtname } from "./fs.ts";
import type { Config } from "./types.ts";
import { testdataDir } from "./test_util.ts";
import { assertEquals } from "./test_deps.ts";

Deno.test("collectPostFiles", async () => {
  const config = {
    postsDir: testdataDir("simple/posts"),
  } as Config;
  const actual = await collectPostFiles(config);
  const expected = [
    testdataDir("simple/posts/2020/12/28.md"),
    testdataDir("simple/posts/2021/01/03.md"),
    testdataDir("simple/posts/index.md"),
  ];
  assertEquals(actual, expected);
});

Deno.test("replaceExtname", () => {
  const actual = replaceExtname("index.md", ".html");
  const expected = "index.html";
  assertEquals(actual, expected);
});
