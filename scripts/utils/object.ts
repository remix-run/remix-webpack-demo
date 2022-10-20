type Entry<Obj extends object> = {
  [K in keyof Obj]: [K, Obj[K]];
}[keyof Obj];
export const entries = <Obj extends object>(obj: Obj): Entry<Obj>[] => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return Object.entries(obj) as any;
};

type FromEntries<Entry extends readonly [PropertyKey, unknown]> = {
  [E in Entry as E[0]]: E[1];
};
export const fromEntries = <
  Entries extends (readonly [PropertyKey, unknown])[]
>(
  entries: Entries
): FromEntries<Entries[number]> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return Object.fromEntries(entries) as any;
};
