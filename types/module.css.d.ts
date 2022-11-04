declare module "*.css" {
  export const link: { rel: "stylesheet"; href: string };
  export const styles: Record<string, string>;
}
