import type { RemixConfig } from "@remix-run/dev/dist/config";
import esbuild from "esbuild";
import type webpack from "webpack";

import { getExports } from "../get-exports";

const BROWSER_EXPORTS = [
  "CatchBoundary",
  "ErrorBoundary",
  "default",
  "handle",
  "links",
  "meta",
  "unstable_shouldReload",
] as const;

async function treeshakeBrowserExports(
  routePath: string,
  remixConfig: RemixConfig
): Promise<string> {
  const xports = getExports(routePath, remixConfig);
  const browserExports = xports.filter((xport) =>
    (BROWSER_EXPORTS as unknown as string[]).includes(xport)
  );

  let virtualModule = "module.exports = {};";
  if (browserExports.length !== 0) {
    virtualModule = `export { ${browserExports.join(
      ", "
    )} } from "${routePath}";`;
  }

  const { outputFiles } = await esbuild.build({
    stdin: { contents: virtualModule, resolveDir: remixConfig.rootDirectory },
    format: "esm",
    target: "es2018",
    treeShaking: true,
    write: false,
    sourcemap: "inline",
    bundle: true,
    plugins: [
      {
        name: "externals",
        setup(build) {
          build.onResolve({ filter: /.*/ }, (args) => {
            if (args.path === routePath) return undefined;
            return { external: true, sideEffects: false };
          });
        },
      },
    ],
  });
  return outputFiles[0].text;
}

export default async function BrowserRoutesLoader(
  this: webpack.LoaderContext<{
    remixConfig: RemixConfig;
    browserRouteRegex: RegExp;
  }>
) {
  const callback = this.async();
  this.cacheable(false);
  const { remixConfig, browserRouteRegex } = this.getOptions();
  const routePath = this.resource.replace(browserRouteRegex, "/");
  const browserRouteVirtualModule = await treeshakeBrowserExports(
    routePath,
    remixConfig
  );
  callback(undefined, browserRouteVirtualModule);
}
