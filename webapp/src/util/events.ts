export type UnregisterEventFunc = () => void;

export function addDocEvent<K extends keyof DocumentEventMap>(
  typ: K,
  listener: (this: GlobalEventHandlers, ev: DocumentEventMap[K]) => any
): UnregisterEventFunc {
  document.addEventListener(typ, listener, false);

  return () => {
    document.removeEventListener(typ, listener, false);
  };
}
