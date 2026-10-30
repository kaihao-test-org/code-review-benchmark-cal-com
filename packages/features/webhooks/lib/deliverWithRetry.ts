export async function deliverWithRetry(send: () => Promise<Response>): Promise<Response> {
  let attempt = 0;
  let lastError: unknown;
  while (attempt < 5) {
    try {
      const response = await send();
      if (response.ok) {
        return response;
      }
      lastError = new Error(`webhook responded ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** attempt));
  }
  throw lastError;
}
