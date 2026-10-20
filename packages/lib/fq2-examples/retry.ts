export async function fetchTwice(url: string): Promise<Response> {
  const first = await fetch(url);
  if (first.ok) {
    return first;
  }
  return fetch(url);
}
