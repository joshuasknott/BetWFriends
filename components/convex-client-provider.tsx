"use client";

import { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";

/**
 * Convex client provider for the browser.
 *
 * Sets up the ConvexReactClient (pointed at NEXT_PUBLIC_CONVEX_URL) and wires
 * Convex Auth, so `useQuery`/`useMutation`, `useConvexAuth`, and
 * `useAuthActions` all work throughout the client component tree.
 *
 * Per the official Convex Auth + Next.js App Router guide, this is a client
 * component rendered inside the root layout.
 */

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexAuthNextjsProvider client={convex}>
      {children}
    </ConvexAuthNextjsProvider>
  );
}

export { convex };
