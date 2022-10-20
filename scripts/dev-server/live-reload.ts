import path from "path";

import * as fse from "fs-extra";
import WebSocket from "ws";

import { type RemixConfig } from "@remix-run/dev/dist/config";
import {
  type BrowserCompiler,
  type CreateCompiler,
  type ServerCompiler,
  watch,
} from "../compiler-kit";

import exitHook from "./vendor/exit-hook";
import prettyMs from "./vendor/pretty-ms";
import { createChannel } from "../utils/channel";

const relativePath = (file: string) => path.relative(process.cwd(), file);

export async function liveReload(
  config: RemixConfig,
  createCompiler: {
    browser: CreateCompiler<BrowserCompiler>;
    server: CreateCompiler<ServerCompiler>;
  },
  callbacks: {
    onInitialBuild?: () => void;
  } = {}
) {
  const wss = new WebSocket.Server({ port: config.devServerPort });
  function broadcast(event: { type: string } & Record<string, unknown>) {
    setTimeout(() => {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(event));
        }
      });
    }, config.devServerBroadcastDelay);
  }
  function log(message: string) {
    message = `💿 ${message}`;
    console.log(message);
    broadcast({ type: "LOG", message });
  }

  const dispose = await watch(config, createCompiler, {
    onInitialBuild: callbacks.onInitialBuild,
    onRebuildStart() {
      log("Rebuilding...");
    },
    onRebuildFinish(durationMs: number) {
      log(`Rebuilt in ${prettyMs(durationMs)}`);
      broadcast({ type: "RELOAD" });
    },
    onFileCreated(file) {
      log(`File created: ${relativePath(file)}`);
    },
    onFileChanged(file) {
      log(`File changed: ${relativePath(file)}`);
    },
    onFileDeleted(file) {
      log(`File deleted: ${relativePath(file)}`);
    },
  });

  const channel = createChannel<void>();
  exitHook(async () => {
    wss.close();
    await dispose();
    fse.emptyDirSync(config.assetsBuildDirectory);
    fse.rmSync(config.serverBuildPath);
    channel.write();
  });
  await channel.read();
}
