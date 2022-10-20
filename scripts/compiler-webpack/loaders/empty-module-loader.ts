import type webpack from "webpack";

export default async function EmptyModuleLoader(
  this: webpack.LoaderContext<never>
) {
  const callback = this.async();
  this.cacheable(false);
  const emptyModule = "module.exports = {};";
  callback(undefined, emptyModule);
}
