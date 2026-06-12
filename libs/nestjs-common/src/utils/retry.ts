export interface RetryWithBackoffOptions {
  /** Maximum number of attempts. When omitted, retries indefinitely. */
  maxRetries?: number;
  /** Upper bound for the exponential backoff delay, in milliseconds. */
  maxDelayMs?: number;
  /** Invoked before each backoff wait, e.g. to log the upcoming retry. */
  onRetry?: (attempt: number, delayMs: number, error: unknown) => void;
}

/**
 * Run `fn`, retrying on failure with capped exponential backoff.
 *
 * With `maxRetries` undefined it retries forever — useful at boot when a
 * dependency (broker, auth source, ...) may not be reachable yet and the
 * caller cannot make progress without it.
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryWithBackoffOptions = {},
): Promise<T> {
  const { maxRetries, maxDelayMs = 30_000, onRetry } = options;
  let attempt = 0;
  for (;;) {
    try {
      return await fn();
    } catch (err) {
      if (maxRetries !== undefined && attempt >= maxRetries - 1) throw err;
      const delayMs = Math.min(1000 * 2 ** attempt, maxDelayMs);
      onRetry?.(attempt + 1, delayMs, err);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      attempt++;
    }
  }
}
