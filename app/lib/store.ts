type Store = {
  getItem: <Item>(key: string) => Item | undefined;
  setItem: <Item>(key: string, item: Item) => void;
};

const createStore = (initial: Record<string, unknown> = {}): Store => {
  let _store = Object.fromEntries(
    Object.entries(initial).map(([k, v]) => [k, JSON.stringify(v)])
  );
  return {
    getItem: <Item>(key: string): Item | undefined => {
      const item = _store[key];
      if (item === undefined) return undefined;
      return JSON.parse(item);
    },
    setItem: <Item>(key: string, item: Item): void => {
      _store[key] = JSON.stringify(item);
    },
  };
};

let store: Store;

declare global {
  var __store: Store | undefined;
}

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
if (process.env.NODE_ENV === "production") {
  store = createStore({ customers: [] });
} else {
  if (!global.__store) {
    global.__store = createStore({ customers: [] });
  }
  store = global.__store;
}

export { store };
