/**
 * Runs once when the Next.js server starts (in both dev and production).
 * Used to validate the environment before serving any requests.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation
 */
export async function register(): Promise<void> {
  const { assertEnv } = await import("@/lib/env");
  assertEnv();
}
