import Password from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { colorFromString } from "../src/lib/utils";

/**
 * Convex Auth configuration.
 *
 * Replaces the old jose JWT + bcrypt password flow. The Password provider
 * hashes with Scrypt (Lucia) by default — no bcrypt needed.
 *
 * The `afterUserCreatedOrUpdated` callback replaces the old `register` route's
 * "welcome bonus" logic: new users get a friendly balance in mock/demo mode
 * so they can start betting immediately.
 */

/** Mock/demo mode gives a welcome balance; live mode starts at 0. */
const WELCOME_BONUS_PENCE = 2000; // £20

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      // Normalize + validate on every flow, porting registerSchema rules.
      profile(params) {
        const email = String(params.email ?? "").toLowerCase().trim();
        const name = String(params.name ?? "").trim();
        if (!email) throw new Error("Email is required");
        if (!name) throw new Error("Tell us your name");
        if (name.length > 40) throw new Error("Name is a bit long");
        return {
          email,
          name,
          // App-specific profile fields seeded at sign-up:
          avatarColor: colorFromString(name),
          balance: WELCOME_BONUS_PENCE,
          emailVerificationTime: 0,
          isAnonymous: false,
        };
      },
      // Default requirement: at least 8 characters (matches old registerSchema).
    }),
  ],
  callbacks: {
    // Seed the welcome-bonus transaction when a brand-new user is created.
    // (Only fires on account creation, not on subsequent sign-ins.)
    async afterUserCreatedOrUpdated(ctx, { userId, existingUserId }) {
      if (existingUserId !== null) return; // sign-in to existing account — skip
      await ctx.db.insert("transactions", {
        userId,
        type: "topup",
        amount: WELCOME_BONUS_PENCE,
        note: "Welcome bonus 🎉",
        reference: "welcome-bonus",
        createdAt: Date.now(),
      });
    },
  },
});
