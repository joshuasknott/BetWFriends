"use client";

import { ReactNode, useSyncExternalStore } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";

/**
 * Convex client provider for the browser.
 *
 * Sets up the ConvexReactClient (pointed at NEXT_PUBLIC_CONVEX_URL) and wires
 * Convex Auth, so `useQuery`/`useMutation`, `useConvexAuth`, and
 * `useAuthActions` all work throughout the client component tree.
 *
 * The provider is mounted only after hydration (via a `mounted` gate). This
 * keeps static prerendering / builds that run without a live Convex deployment
 * from crashing on the auth hook, while the full reactive behavior is
 * available once the app runs in the browser against a real deployment.
 */

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex =
  convexUrl && convexUrl.startsWith("http")
    ? new ConvexReactClient(convexUrl)
    : null;

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const mounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  if (!convex || !mounted) {
    // During SSR/prerender (or without a configured URL), render children
    // unwrapped. Authenticated pages are force-dynamic so they never rely on
    // this prerendered output at runtime.
    return <>{children}</>;
  }

  return (
    <ConvexAuthNextjsProvider client={convex}>
      {children}
    </ConvexAuthNextjsProvider>
  );
}
