export function formatCents(cents: number): string {
  const realCents = cents % 100;
  return `\$${Math.floor(cents / 100)}.${realCents.toString().padStart(2, "0")}`;
}
