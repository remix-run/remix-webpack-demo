# Remix Webpack Demo

This is an example of using Webpack to build Remix.

To use this for your own Remix app, **check out the [migration guide](./docs/migration-guide.md)**. 👀

---

How this repo was made:

1. Create a new project with [Create React App](https://create-react-app.dev/)
2. 👉 Implement the [React Router v6.4 tutorial](https://reactrouter.com/en/main/start/tutorial)
3. 🚚 [Migrate to Remix](https://remix.run/docs/en/v1/guides/migrating-react-router-app)
4. Replace standard Remix dev tools with Webpack-based compiler found in `./scripts`

The commit history includes 👉 and 🚚 emojis so you can follow along with which commits came from which step.

## Setup

### 1 Install

```sh
npm install
```

### 2 `.env`

Copy `.env.example` as `.env`:

```sh
DATABASE_URL="file:./dev.db"
```

### 3 Initialize the database

```sh
npx prisma db push
```

If you want some data for development, seed the database:

```sh
npx prisma db seed
```

## Configuration

Webpack configs can be found at:

- [`./config.browser.ts`](./config.browser.ts)
- [`./config.server.ts`](./config.server.ts)

You can add loaders or plugins there to add support for any features you'd like from Webpack!

For example, you could install [`postcss-loader`](https://webpack.js.org/loaders/postcss-loader/) and add it to both the browser and server configs to get [PostCSS](https://postcss.org/) features!
