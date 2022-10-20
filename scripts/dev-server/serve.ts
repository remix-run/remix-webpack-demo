import type { Server } from "http";
import os from "os";
import * as path from "path";

import express from "express";
import * as fse from "fs-extra";
import getPort, { makeRange } from "get-port";
import { createApp } from "@remix-run/serve";
import { RemixConfig } from "@remix-run/dev/dist/config";

import { liveReload } from "./live-reload";
import {
  BrowserCompiler,
  CreateCompiler,
  ServerCompiler,
} from "../compiler-kit";

// Import environment variables from: .env, failing gracefully if it doesn't exist
async function loadEnv(rootDirectory: string): Promise<void> {
  const envPath = path.join(rootDirectory, ".env");
  try {
    await fse.readFile(envPath);
  } catch (e) {
    return;
  }

  console.log(`Loading environment variables from .env`);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const result = require("dotenv").config({ path: envPath });
  if (result.error) {
    throw result.error;
  }
}

type Mode = "development" | "test" | "production";

export async function serve(
  config: RemixConfig,
  mode: Mode = "development",
  createCompiler: {
    browser: CreateCompiler<BrowserCompiler>;
    server: CreateCompiler<ServerCompiler>;
  },
  portArg?: number
) {
  await loadEnv(config.rootDirectory);

  const port = await getPort({
    port: portArg
      ? Number(portArg)
      : process.env.PORT
      ? Number(process.env.PORT)
      : makeRange(3000, 3100),
  });

  if (config.serverEntryPoint) {
    throw new Error("remix dev is not supported for custom servers.");
  }

  const app = express();
  app.disable("x-powered-by");
  app.use((_, __, next) => {
    purgeAppRequireCache(config.serverBuildPath);
    next();
  });
  app.use(
    createApp(
      config.serverBuildPath,
      mode,
      config.publicPath,
      config.assetsBuildDirectory
    )
  );

  let server: Server | undefined = undefined as Server | undefined;
  try {
    await liveReload(config, createCompiler, {
      onInitialBuild: () => {
        const onListen = () => {
          const address =
            process.env.HOST ||
            Object.values(os.networkInterfaces())
              .flat()
              .find((ip) => String(ip?.family).includes("4") && !ip?.internal)
              ?.address;

          if (!address) {
            console.log(`Remix App Server started at http://localhost:${port}`);
          } else {
            console.log(
              `Remix App Server started at http://localhost:${port} (http://${address}:${port})`
            );
          }
        };

        server = process.env.HOST
          ? app.listen(port, process.env.HOST, onListen)
          : app.listen(port, onListen);
      },
    });
  } finally {
    server?.close();
  }
}

function purgeAppRequireCache(buildPath: string) {
  for (const key in require.cache) {
    if (key.startsWith(buildPath)) {
      delete require.cache[key];
    }
  }
}
