export type ValOrErr<T> = [T, Error];

export function withErr<T>(p: Promise<T>): Promise<ValOrErr<T>> {
  return p.then(
    d => {
      return [d, null] as ValOrErr<T>;
    },
    err => {
      if (err instanceof Error) {
        return [null, err] as ValOrErr<T>;
      }
      return [null, new Error(err)] as ValOrErr<T>;
    }
  );
}
