import path from "path";
import { builtinModules } from "module";

import { ESBuildMinifyPlugin } from "esbuild-loader";
import type { RemixConfig } from "@remix-run/dev/dist/config";
import webpack from "webpack";
import VirtualModulesPlugin from "webpack-virtual-modules";

import * as obj from "./scripts/utils/object";

const BROWSER_ROUTE_PREFIX = "__remix_browser_route__";
const BROWSER_ROUTE_REGEX = new RegExp("/" + BROWSER_ROUTE_PREFIX);
const getBrowserRoutes = (remixConfig: RemixConfig): [string, string][] =>
  obj
    .entries(remixConfig.routes)
    .map(([id, route]) => [
      id,
      path.resolve(
        remixConfig.appDirectory,
        path.dirname(route.file),
        BROWSER_ROUTE_PREFIX + path.basename(route.file)
      ),
    ]);

const mode =
  process.env.NODE_ENV === "development" ? "development" : "production";

export const createBrowserConfig = (
  remixConfig: RemixConfig
): webpack.Configuration => {
  const browserRoutes = getBrowserRoutes(remixConfig);
  return {
    devtool: mode === "development" ? "inline-cheap-source-map" : undefined,
    target: "web",
    resolve: {
      fallback: obj.fromEntries(builtinModules.map((m) => [m, false] as const)),
      alias: {
        "~": remixConfig.appDirectory,
      },
      extensions: [".tsx", ".ts", ".jsx", ".js"],
    },
    entry: {
      "entry.client": path.resolve(
        remixConfig.appDirectory,
        remixConfig.entryClientFile
      ),
      ...obj.fromEntries(browserRoutes),
    },
    module: {
      rules: [
        {
          test: /\.[j|t]sx?$/,
          loader: "esbuild-loader",
          exclude: /node_modules/,
          options: {
            target: "es2019",
            loader: "tsx",
          },
        },

        {
          test: /\.module\.css$/i,
          use: [
            {
              loader: require.resolve(
                "./scripts/compiler-webpack/loaders/remix-css-loader.ts"
              ),
              options: { emit: true },
            },
            {
              loader: "css-loader",
              options: { modules: true },
            },
          ],
        },
        {
          test: /\.css$/i,
          type: "asset/resource",
          exclude: /\.module\.css$/i,
        },

        {
          test: /\.server\./,
          loader: require.resolve(
            path.join(
              __dirname,
              "./scripts/compiler-webpack/loaders/empty-module-loader.ts"
            )
          ),
        },
        {
          test: BROWSER_ROUTE_REGEX,
          loader: require.resolve(
            path.join(
              __dirname,
              "./scripts/compiler-webpack/loaders/browser-route-loader.ts"
            )
          ),
          options: { remixConfig, browserRouteRegex: BROWSER_ROUTE_REGEX },
        },
      ],
    },
    output: {
      path: remixConfig.assetsBuildDirectory,
      publicPath: remixConfig.publicPath,
      module: true,
      library: { type: "module" },
      chunkFormat: "module",
      chunkLoading: "import",
      assetModuleFilename: "_assets/[name]-[contenthash][ext]",
      cssChunkFilename: "_assets/[name]-[contenthash][ext]",
      filename: "[name]-[contenthash].js",
      chunkFilename: "[name]-[contenthash].js",
    },
    optimization: {
      moduleIds: "deterministic",
      runtimeChunk: "single",

      // treeshake unused code in development
      // needed so that browser build does not pull in server code
      usedExports: true,
      innerGraph: true,
      splitChunks: {
        chunks: "async", // not all, async as workaround
      },
      minimize: mode === "production",
      minimizer: [new ESBuildMinifyPlugin({ target: "es2019" })],
    },
    externalsType: "module",
    experiments: {
      outputModule: true,
    },
    plugins: [
      new VirtualModulesPlugin(
        obj.fromEntries(browserRoutes.map(([, route]) => [route, ""] as const))
      ),

      new webpack.EnvironmentPlugin({
        REMIX_DEV_SERVER_WS_PORT: JSON.stringify(remixConfig.devServerPort),
      }),

      // shim react so it can be used without importing
      new webpack.ProvidePlugin({ React: ["react"] }),
    ],
  };
};
