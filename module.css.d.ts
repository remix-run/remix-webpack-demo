declare module "*.css" {
  export const link: { rel: "stylesheet"; href: string };
  export const styles: Record<string, string>;
}

// declare module "*.css" {
//   interface ClassNames {
//     [className: string]: string;
//     default: string;
//   }
//   const classNames: ClassNames;
//   export = classNames;
// }
