import { interpolateName } from "loader-utils";
import webpack from "webpack";

type Exports = string[][] & { locals?: Record<string, string> };

const getPublicPath = <T>(loaderContext: webpack.LoaderContext<T>) => {
  let { publicPath } = loaderContext._compilation!.outputOptions;
  if (typeof publicPath !== "string") {
    throw Error("Public path must be a string");
  }
  return publicPath;
};

const getCssChunkFilename = <T>(loaderContext: webpack.LoaderContext<T>) => {
  let { cssChunkFilename, assetModuleFilename } =
    loaderContext._compilation!.outputOptions;
  return typeof cssChunkFilename === "string"
    ? cssChunkFilename
    : typeof assetModuleFilename === "string"
    ? assetModuleFilename
    : "_assets/[name]-[contenthash].[ext]";
};

export async function pitch(
  this: webpack.LoaderContext<{ emit: boolean }>,
  source: string | Buffer
) {
  let callback = this.async();
  let options = this.getOptions();

  let originalExports = (await this.importModule(
    this.resourcePath + ".webpack[javascript/auto]" + "!=!" + source
  )) as
    | { __esModule: true; default: Exports }
    | ({ __esModule: false } & Exports);

  let exports = originalExports.__esModule
    ? originalExports.default
    : originalExports;

  let css = exports[0].slice(1).join("\n");
  let assetPath = interpolateName(this, getCssChunkFilename(this), {
    content: css,
  });

  let result = `
export const link = {
  rel: "stylesheet",
  href: ${JSON.stringify(getPublicPath(this) + assetPath)},
}
`;

  let classNamesMap = exports.locals;
  if (classNamesMap !== undefined) {
    result += `\nexport const styles = ${JSON.stringify(classNamesMap)}`;
  }

  // TODO: sourcemaps?
  if (options.emit) {
    this.emitFile(assetPath, css);
  }

  return callback(undefined, result);
}
