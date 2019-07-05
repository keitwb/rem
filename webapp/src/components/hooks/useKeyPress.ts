import { DependencyList, useEffect } from "react";

import { addDocEvent } from "@/util/events";

export default function useKeyPress(
  keyFilter: string,
  onKeyPress: (key: string) => void | boolean,
  deps: DependencyList
) {
  useEffect(() => {
    const unregisterKeydown = addDocEvent("keydown", e => {
      if (!keyFilter || keyFilter === e.key) {
        const propagate = onKeyPress(e.key);
        if (!propagate) {
          e.stopPropagation();
        }
      }
    });

    return () => {
      unregisterKeydown();
    };
  }, deps);
}
