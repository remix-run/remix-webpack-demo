# Remix Webpack Demo

This repo was made by:

1. Creating a new project with [Create React App](https://create-react-app.dev/)
2. 👉 Implementing the [React Router v6.4 tutorial](https://reactrouter.com/en/main/start/tutorial)
3. 🚚 [Migrating to Remix](https://remix.run/docs/en/v1/guides/migrating-react-router-app)
4. Replacing standard Remix dev tools with Webpack-based compiler found in `./scripts`

Check out the commit history for all the gory details!

## Installation

```sh
npm install
```

Copy into `.env`:

```sh
DATABASE_URL="file:./dev.db"
```

Initialize the database:

```sh
npx prisma db push
```

Optional: then, seed the database for dev:

```sh
npx prisma db seed
```

## Webpack configuration

Webpack configs for the browser and server builds can be found in:

- `./scripts/compiler-webpack/browser-config.ts`
- `./scripts/compiler-webpack/server-config.ts`

Additional loaders and plugins can be added there to support any other features you want from Webpack!
