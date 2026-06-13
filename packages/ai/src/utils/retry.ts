/**
 * Exponential backoff retry wrapper for promise-returning async tasks.
 * Prevents retrying client errors like 400, 401, 403, and 404 which are non-recoverable.
 */
export async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000, backoffFactor = 2): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries <= 0) {
      throw error;
    }

    // Do not retry on definite client failures (Auth errors, Bad prompts, Not Found)
    if (error && typeof error.status === 'number') {
      const s = error.status;
      if (s === 400 || s === 401 || s === 403 || s === 404) {
        throw error;
      }
    }

    let currentDelay = delay;
    if (error && typeof error.retryAfterSeconds === 'number') {
      currentDelay = error.retryAfterSeconds * 1000;
      console.warn(`[AI API Retry] Rate Limit (429) active. Server requested Retry-After ${error.retryAfterSeconds}s.`);
    } else if (error && typeof error.retryAfterMs === 'number') {
      currentDelay = error.retryAfterMs;
      console.warn(`[AI API Retry] Server requested precise backoff delay of ${error.retryAfterMs}ms.`);
    }

    const errorMsg = error instanceof Error ? error.message : String(error);
    console.warn(
      `[AI API Retry] Call failed. Retrying in ${currentDelay}ms... (${retries} attempts left). Error: ${errorMsg}`,
    );

    await new Promise((resolve) => setTimeout(resolve, currentDelay));

    const nextDelay =
      error && (typeof error.retryAfterSeconds === 'number' || typeof error.retryAfterMs === 'number')
        ? delay // Reset backoff factor if we utilized an explicit server-directed delay
        : delay * backoffFactor;

    return withRetry(fn, retries - 1, nextDelay, backoffFactor);
  }
}
