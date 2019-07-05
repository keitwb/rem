import { DependencyList, RefObject, useEffect } from "react";

export default function useOutsideClick(ref: RefObject<HTMLElement>, onOutsideClick: () => void, deps: DependencyList) {
  useEffect(() => {
    const cb = (e: Event) => {
      if (ref.current.contains(e.target as Node)) {
        return;
      }
      onOutsideClick();
    };
    document.addEventListener("mousedown", cb, false);

    return () => {
      document.removeEventListener("mousedown", cb);
    };
  }, deps);
}
