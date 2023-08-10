export function isNumber(
  value: undefined | null | string | number | boolean
): value is number {
  return typeof value === "number" && !isNaN(value);
}
