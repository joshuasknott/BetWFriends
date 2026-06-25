"use client";

import { ReactNode } from "react";
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import { useConvexAuth } from "@convex-dev/auth/react";

/**
 * Convex client provider for the browser.
 *
 * Sets up the ConvexReactClient (pointed at NEXT_PUBLIC_CONVEX_URL) and wires
 * it to the Convex Auth context provided by the Next.js server provider.
 *
 * If a Convex URL is unavailable, children render unwrapped so static tooling
 * can still inspect the app. Runtime routes should configure Convex.
 */

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex =
  convexUrl && convexUrl.startsWith("http")
    ? new ConvexReactClient(convexUrl)
    : null;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!convex) {
    return <>{children}</>;
  }

  return (
    <ConvexProviderWithAuth client={convex} useAuth={useConvexAuth}>
      {children}
    </ConvexProviderWithAuth>
  );
}
