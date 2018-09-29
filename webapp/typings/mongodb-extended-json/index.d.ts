declare module "mongodb-extended-json" {
  function parse(text: string, reviver?: (key: any, value: any) => any): any;
  function stringify(value: any, replacer?: (key: string, value: any) => any, space?: string | number): string;
  function stringify(value: any, replacer?: (number | string)[] | null, space?: string | number): string;
}
