/**
 * Shared domain types — framework-agnostic, used by both the pure business
 * logic (`lib/`) and the Convex functions (`convex/`).
 *
 * These replace the old `@prisma/client` type imports so the pure functions
 * have no ORM dependency. Convex document types are structurally compatible:
 * a Convex `Doc<"bet">` is assignable to `BetLike` (its `_id` is `id`, etc.).
 *
 * Dates are epoch milliseconds here (Convex's native format). The pure
 * functions were written to accept `Date | string | number` for `closesAt`
 * etc., so this stays compatible.
 */

export type UserRef = {
  id: string;
  name: string;
  avatarColor: string;
};

export type BetLike = {
  id: string;
  groupId: string;
  creatorId: string;
  title: string;
  description?: string | null;
  amount: number;
  status: string;
  outcome?: string | null;
  createdAt: number;
  closesAt: number;
  settledAt?: number | null;
};

export type BetSideLike = {
  id: string;
  betId: string;
  label: string;
};

export type WagerLike = {
  id: string;
  betId: string;
  sideId: string;
  userId: string;
  amount: number;
  createdAt: number;
};

/**
 * Brand a plain string (e.g. a URL param) as a Convex `Id<Table>`.
 *
 * Convex IDs are strings at runtime but carry a branded type at the type
 * level. URL params arrive as `string`, so this helper bridges them into the
 * generated `api.*` argument types without scattering `as any` casts. It is
 * a pure cast — no runtime work.
 *
 *   placeWager({ betId: asId<"bets">(betId), sideId })
 */
export function asId<Table extends string>(
  id: string,
): import("convex/values").GenericId<Table> {
  return id as unknown as import("convex/values").GenericId<Table>;
}

