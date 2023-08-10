export function isNumber(value): value is number {
  return typeof value === "number" && !isNaN(value);
}
