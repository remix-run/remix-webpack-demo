import { readConfig } from "@remix-run/dev/dist/config.js";
import {
  createBrowserCompiler,
  createServerCompiler,
} from "./compiler-webpack";
import { build } from "./compiler-kit";

async function command() {
  console.time("Remix Compile");
  let remixConfig = await readConfig();
  let compiler = {
    browser: createBrowserCompiler(remixConfig),
    server: createServerCompiler(remixConfig),
  };
  await build(remixConfig, compiler);
  console.timeEnd("Remix Compile");
}

command();
