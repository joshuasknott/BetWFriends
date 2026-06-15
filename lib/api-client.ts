/**
 * Client-side fetch wrapper that automatically attaches the CSRF token header
 * to mutating requests. The token is read from the `bwf_csrf` cookie set by
 * middleware.
 *
 * Usage in client components:
 *   import { api } from "@/lib/api-client";
 *   const res = await api("/api/bets", { method: "POST", body: ... });
 */

import { CSRF_COOKIE, CSRF_HEADER } from "@/lib/csrf";

function getCookie(name: string): string | undefined {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="));
  return match?.split("=").slice(1).join("=");
}

export type ApiInit = Omit<RequestInit, "body"> & {
  body?: unknown;
};

/**
 * Fetch wrapper that JSON-encodes the body and attaches the CSRF header to
 * mutating requests automatically.
 */
export async function api(
  input: string,
  init: ApiInit = {},
): Promise<Response> {
  const { body, headers, method, ...rest } = init;

  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(headers as Record<string, string> | undefined),
  };

  const isMutating = !!method && !["GET", "HEAD", "OPTIONS"].includes(method);

  let finalBody: BodyInit | undefined;
  if (body !== undefined) {
    finalHeaders["Content-Type"] = "application/json";
    finalBody = JSON.stringify(body);
  }

  if (isMutating) {
    const token = getCookie(CSRF_COOKIE);
    if (token) finalHeaders[CSRF_HEADER] = token;
  }

  return fetch(input, {
    ...rest,
    method,
    headers: finalHeaders,
    body: finalBody,
  });
}

/**
 * Convenience helper: call `api()` and parse the JSON response, throwing on
 * non-2xx. Returns the parsed body.
 */
export async function apiJson<T = unknown>(
  input: string,
  init: ApiInit = {},
): Promise<T> {
  const res = await api(input, init);
  const json = (await res.json().catch(() => ({}))) as T &
    { error?: string };
  if (!res.ok) {
    const message = json.error ?? `Request failed (${res.status})`;
    const err = new Error(message) as Error & { status: number };
    err.status = res.status;
    throw err;
  }
  return json;
}
