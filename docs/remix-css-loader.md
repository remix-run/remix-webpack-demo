# remix-css-loader

[This loader](../scripts/compiler-webpack/loaders/remix-css-loader.ts) adapts the output of `css-loader` so that it is Remix compatible.

You should probably use it any time that you use `css-loader` (instead of simply using `type: "asset/resource'`) in your Webpack config.

It does so by importing the JS module produced by `css-loader` which contains exports for the transpiled CSS as well as the mapping for user-facing classnames to their hashed counterparts.

It then computes then writes the transpiled CSS to the configured output location.

Finally, it resolves `*.module.css` as:

```ts
export const link: { rel: "stylesheet"; href: string };
export const styles: Record<string, string>;
```

## Example: CSS Modules 

For [CSS Modules](https://github.com/css-modules/css-modules), first add `css-loader` and `remix-css-loader` to your config:

```ts
{
  module: {
    rules: [
      {
        // handle CSS Modules
        test: /\.module\.css$/i,
        use: [
          {
            loader: require.resolve("./loaders/remix-css-loader.ts"),
            // emit the CSS for the browser build
            // set `emit: false` for the server build
            options: { emit: true },
          },
          {
            loader: "css-loader",
            options: { modules: true },
          },
        ],
      },
      {
        // handle normal CSS
        test: /\.css$/i,
        type: "asset/resource",
        exclude: /\.module\.css$/i,
      },
    ]
  }
}
```

### Usage

```css
/* my.module.css */

.title {
  background-color: red;
}
```

```ts
import { link as cssLink, styles } from "./path/to/my.module.css"

// add `link` to your route's links
export const links = () => [cssLink]

export default function Route() {
  // use `styles` as a normal CSS Modules import
  return <h1 className={styles.title}>Hello world!</h1>
}
```