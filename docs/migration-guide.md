# Migration guide

Migrate your [React Router](https://reactrouter.com/en/main) app to Remix!

---

⚠️⚠️⚠️

**DO NOT USE THIS UNLESS YOU PLAN TO MIGRATE TO THE OFFICIAL REMIX COMPILER**

⚠️⚠️⚠️

This is _NOT_ intended to replace the official Remix compiler.

This is designed to be a stepping stone for users migrating from Webpack or [Create React App](https://create-react-app.dev/).

The idea is that if you depend on Webpack features, you can use this approach to immediately get up and running with Remix.

Then you can incrementally migrate your app to not depend on Webpack-isms and eventually use the Remix compiler.

## 1: Upgrade to React Router 6.4

Follow the [React Router upgrade guide](https://reactrouter.com/en/main/upgrading/v5).

## 2: Start migrating to Remix

Follow the [Remix Migration guide](https://remix.run/docs/en/v1/guides/migrating-react-router-app) but STOP 🛑 when you get to ["Replacing your bundler with Remix"](https://remix.run/docs/en/v1/guides/migrating-react-router-app#replacing-the-bundler-with-remix).

## 3: Install the Webpack compiler

Copy the [unofficial Remix Webpack compiler scripts](../scripts/) from this repo into `scripts/` directory at the root of your Remix project.

You'll also need to install the dependencies of the unofficial Remix Webpack compiler:

```sh
npm install -D \
  @types/express \
  @types/fs-extra \
  @types/webpack-node-externals \
  @types/ws \
  esbuild \
  esbuild-loader \
  express \
  fs-extra \
  ts-node \
  webpack \
  webpack-node-externals \
  webpack-virtual-modules \
  ws
```

## 4: `package.json` scripts

Copy `build`, `start`, and `dev` scripts to your `package.json`

```json
{
  "scripts": {
    "build": "ts-node ./scripts/build.ts",
    "start": "remix-serve build",
    "dev": "NODE_ENV=development ts-node ./scripts/dev.ts"
  }
}
```

## 5: Browser and server configs

Copy [`config.browser.ts`](../config.browser.ts) and [`config.browser.ts`](../config.server.ts) into the root of your Remix project.

NOTE: you may need add these files to your `tsconfig.json` if Typescript complains:

```json
{
  // you can add _just_ the configs if you want, but this is easier
  "include": ["**/*.ts", "**/*.tsx"]
}
```

## That's it!

You should now be able to run the scripts successfully.

You can also customize the Webpack configs for the browser or server to add Webpack loaders and plugins for any features you depend on.
