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
