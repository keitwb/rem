export function truncate(s: string, len: number): string {
  if (s.length > len) {
    return s.substring(0, len - 3) + "...";
  } else {
    return s;
  }
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.substr(1);
}

/**
 * Differs from String.prototype.split in that all of the remainder of the string beyond the limit
 * number of splits is retained in the last element instead of discarded.
 */
export function splitLimit(s: string, delimiter: string, limit: number): string[] {
  const parts = s.split(delimiter);
  if (parts.length > limit) {
    return [...parts.slice(0, limit), parts.slice(limit).join(delimiter)];
  }
  return parts;
}
