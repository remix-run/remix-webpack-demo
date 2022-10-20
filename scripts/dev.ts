import { readConfig } from "@remix-run/dev/dist/config.js";
import { serve } from "./dev-server";
import {
  createBrowserCompiler,
  createServerCompiler,
} from "./compiler-webpack";

async function command() {
  let remixConfig = await readConfig();
  serve(remixConfig, "development", {
    browser: createBrowserCompiler,
    server: createServerCompiler,
  });
}

command();
