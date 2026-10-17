export function numericQueryParam(search: string, name: string, fallback: number): number {
  const params = new URLSearchParams(search);
  const value = Number(params.get(name));
  return value || fallback;
}
