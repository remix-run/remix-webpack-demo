import path from "path";

import type { AssetsManifest } from "@remix-run/dev/dist/compiler/assets";
import type { RemixConfig } from "@remix-run/dev/dist/config";
import webpack from "webpack";

import * as obj from "../utils/object";
import { BrowserCompiler, CreateCompiler } from "../compiler-kit";
import { getExports } from "./get-exports";
import { createBrowserConfig } from "../../config.browser";

function createUrl(publicPath: string, file: string): string {
  return (
    publicPath.split(path.win32.sep).join("/") +
    (file || "").split(path.win32.sep).join("/")
  );
}

function check(stats: webpack.Stats): void {
  const statsWarningFilters = [
    "node_modules/@remix-run/react/esm/routeModules.js",
  ];
  if (stats.hasErrors()) {
    console.error(
      stats.toString({
        colors: true,
        errors: true,
        logging: "warn",
        warningsFilter: statsWarningFilters,
      })
    );
    throw new Error("Client build failed");
  }
}

function createNamedChunkGroupFactory(
  stats: webpack.StatsCompilation,
  publicPath: string
): (group: string) => string[] {
  const chunksById = new Map(stats.chunks?.map((chunk) => [chunk.id, chunk]));
  return (group: string) => {
    const files = new Set<string>();
    stats.namedChunkGroups?.[group].chunks?.forEach((chunkId) => {
      const chunk = chunksById.get(chunkId);
      chunk?.files?.forEach((file) => files.add(createUrl(publicPath, file)));
    });
    return [...files];
  };
}

const getAssets = (
  { entrypoints }: webpack.StatsCompilation,
  entrypointId: string
) => {
  if (entrypoints === undefined) throw Error("todo");
  const { assets } = entrypoints[entrypointId];
  if (assets === undefined) throw Error("todo");
  return assets;
};

async function toManifest(
  remixConfig: RemixConfig,
  stats: webpack.Stats
): Promise<AssetsManifest> {
  const compilationStats = stats.toJson({
    modules: true,
    entrypoints: true,
    assets: true,
    groupAssetsByChunk: true,
    hash: true,
  });
  const getByNamedChunkGroup = createNamedChunkGroupFactory(
    compilationStats,
    remixConfig.publicPath
  );

  const entryImports = getByNamedChunkGroup("entry.client");
  const entryModule = createUrl(
    remixConfig.publicPath,
    getAssets(compilationStats, "entry.client").slice(-1)[0].name
  );
  const rootImports = getByNamedChunkGroup("root");

  // TODO: what are runtime imports? dynamic imports?
  // let runtimeImports = compilationStats.assetsByChunkName["runtime"].map(
  //   (asset) => createUrl(remixConfig.publicPath, asset)
  // );

  const routes = obj.fromEntries(
    obj.entries(remixConfig.routes).map(([routeId, route]) => {
      const assets = getAssets(compilationStats, routeId);
      const routeImports = assets
        .slice(0, -1)
        .map((asset) => createUrl(remixConfig.publicPath, asset.name));
      const routeModule = createUrl(
        remixConfig.publicPath,
        assets.slice(-1)[0].name
      );
      const routePath = path.resolve(remixConfig.appDirectory, route.file);
      const routeExports = getExports(routePath, remixConfig);
      return [
        routeId,
        {
          id: route.id,
          parentId: route.parentId,
          path: route.path,
          index: route.index,
          caseSensitive: route.caseSensitive,
          module: routeModule,
          imports: routeImports,
          hasAction: routeExports.includes("action"),
          hasLoader: routeExports.includes("loader"),
          hasCatchBoundary: routeExports.includes("CatchBoundary"),
          hasErrorBoundary: routeExports.includes("ErrorBoundary"),
        },
      ] as const;
    })
  );

  const version = compilationStats.hash;
  if (version === undefined) throw Error("todo");
  return {
    version,
    url: createUrl(
      remixConfig.publicPath,
      `manifest-${version.toUpperCase()}.js`
    ),
    entry: {
      imports: [
        ...new Set([/* ...runtimeImports, */ ...entryImports, ...rootImports]),
      ],
      module: entryModule,
    },
    routes,
  };
}

export const createBrowserCompiler: CreateCompiler<BrowserCompiler> = (
  remixConfig
) => {
  const webpackConfig = createBrowserConfig(remixConfig);
  const compiler = webpack(webpackConfig);

  const build: BrowserCompiler["build"] = async (manifestChannel) => {
    return new Promise<void>((resolve, reject) => {
      console.time("browser build");
      compiler.run(async (error, stats) => {
        if (error) return reject(error);
        if (stats === undefined) return reject("todo");
        check(stats);
        const manifest = await toManifest(remixConfig, stats);
        manifestChannel.write(manifest);
        resolve();
        console.timeEnd("browser build");
      });
    });
  };
  return {
    build,
    dispose: () => {
      compiler.close(() => undefined);
    },
  };
};
