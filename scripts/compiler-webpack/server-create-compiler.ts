import path from "path";

import type { AssetsManifest } from "@remix-run/dev/dist/compiler/assets";
import type { RemixConfig } from "@remix-run/dev/dist/config";
import webpack from "webpack";
import VirtualModulesPlugin from "webpack-virtual-modules";

import { CreateCompiler, ServerCompiler } from "../compiler-kit";
import { createServerConfig } from "../../config.server";

const dynamicVirtualModule = (compiler: webpack.Compiler, vmodPath: string) => {
  const tapName = "Remix Webpack Compiler";
  const virtualModules = new VirtualModulesPlugin();
  virtualModules.apply(compiler);

  let nmod: webpack.NormalModule | undefined = undefined;
  compiler.hooks.normalModuleFactory.tap(tapName, (normalModuleFactory) => {
    normalModuleFactory.hooks.module.tap(tapName, (mod) => {
      if (mod instanceof compiler.webpack.NormalModule) {
        if (mod.request.endsWith(vmodPath)) {
          nmod = mod;
        }
      }
      return mod;
    });
  });
  compiler.hooks.thisCompilation.tap(tapName, () => {
    nmod?.invalidateBuild();
  });

  return (contents: string) => virtualModules.writeModule(vmodPath, contents);
};

export const createServerCompiler: CreateCompiler<ServerCompiler> = (
  remixConfig
) => {
  const webpackConfig = createServerConfig(remixConfig);
  const compiler = webpack(webpackConfig);

  const updateServerBuild = dynamicVirtualModule(
    compiler,
    "node_modules/@remix-run/dev/server-build"
  );

  const build: ServerCompiler["build"] = async (manifestChannel) => {
    const manifest = await manifestChannel.read();

    updateServerBuild(serverBuild(remixConfig, manifest));
    return new Promise<void>((resolve, reject) => {
      console.time("server build");
      compiler.run((error) => {
        if (error) reject(error);
        console.timeEnd("server build");
        resolve();
      });
    });
  };
  return {
    build,
    dispose: () => compiler.close(() => undefined),
  };
};

const serverBuild = (config: RemixConfig, manifest: AssetsManifest): string => {
  const routeImports = Object.values(config.routes).map((route, index) => {
    return `import * as route${index} from "${path.resolve(
      config.appDirectory,
      route.file
    )}";`;
  });
  const routes = Object.entries(config.routes).map(
    ([routeId, route], index) => {
      return `${JSON.stringify(routeId)}: {
      id: ${JSON.stringify(route.id)},
      parentId: ${JSON.stringify(route.parentId)},
      path: ${JSON.stringify(route.path)},
      index: ${JSON.stringify(route.index)},
      caseSensitive: ${JSON.stringify(route.caseSensitive)},
      module: route${index}
    }`;
    }
  );

  return `
  import * as entryServer from "${path.resolve(
    config.appDirectory,
    config.entryServerFile
  )}";
  ${routeImports.join("\n")}
  export const entry = { module: entryServer };
  export const routes = {
    ${routes.join(",\n  ")}
  };
  export const assets = ${JSON.stringify(manifest)};
`;
};
