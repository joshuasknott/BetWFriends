import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";

export const SESSION_COOKIE = "bwf_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function getSecret(): Uint8Array {
  const secret =
    process.env.SESSION_SECRET ??
    "betwfriends-dev-secret-change-me-in-production-please-use-32+chars";
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  userId: string;
};

/** Cookies are only secure-flagged when served over a non-localhost origin,
 *  so local testing over HTTP still works. */
async function shouldUseSecureCookie(): Promise<boolean> {
  if (process.env.NODE_ENV !== "production") return false;
  try {
    const h = await headers();
    const host = (h.get("host") ?? "").toLowerCase();
    const isLocal =
      host.startsWith("localhost") ||
      host.startsWith("127.0.0.1") ||
      host.startsWith("[::1]");
    return !isLocal;
  } catch {
    return true;
  }
}

export async function createSession(userId: string): Promise<void> {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: await shouldUseSecureCookie(),
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSessionUserId(): Promise<string | null> {
  const store = await cookies();
  const cookie = store.get(SESSION_COOKIE);
  if (!cookie?.value) return null;
  try {
    const { payload } = await jwtVerify(cookie.value, getSecret());
    const userId = (payload as SessionPayload).userId;
    return typeof userId === "string" ? userId : null;
  } catch {
    return null;
  }
}

/** Returns the current user, or null if not signed in. */
export async function getCurrentUser(): Promise<User | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user;
}

/** Returns the current user or redirects to /login. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Public-safe user object (no password hash) */
export function publicUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarColor: user.avatarColor,
    balance: user.balance,
    createdAt: user.createdAt,
  };
}
