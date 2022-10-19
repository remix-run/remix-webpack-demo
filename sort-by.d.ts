declare module "sort-by" {
  type CompareFn<T> = (a: T, b: T) => number;
  export default function sortBy<T extends Record<PropertyKey, unknown>>(
    ...keys: (keyof T | `-${keyof T & string}`)[]
  ): CompareFn<T>;
}
