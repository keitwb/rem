interface Comparable {
  equals(other: any): boolean;
}

function isComparable(o: any): o is Comparable {
  return "equals" in o;
}

// Tests if two arrays are equal according to === on each item in the two arrays.
export function arraysEqual(a: any[], b: any[]) {
  if (a === b) {
    return true;
  }

  if (a === null || b === null) {
    return false;
  }

  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; ++i) {
    const ai = a[i];
    const bi = b[i];

    if (isComparable(ai)) {
      if (!ai.equals(bi)) {
        return false;
      }
    } else if (ai !== bi) {
      return false;
    }
  }

  return true;
}

export function ensureArray<T>(inst: T | T[]): T[] {
  if (inst instanceof Array) {
    return inst;
  }
  return [inst];
}
