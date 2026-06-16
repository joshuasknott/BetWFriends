/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import { auth } from "../auth.js";
import { bets } from "../bets.js";
import { comments } from "../comments.js";
import { groups } from "../groups.js";
import { http } from "../http.js";
import { profile } from "../profile.js";
import { wallet } from "../wallet.js";
import { seed } from "../seed.js";
import { anyApi } from "convex/server";

const fullApi = {
  auth,
  bets,
  comments,
  groups,
  http,
  profile,
  wallet,
  seed,
};

export const api = anyApi(fullApi);
export const internal = anyApi(fullApi);
export const components = {};
