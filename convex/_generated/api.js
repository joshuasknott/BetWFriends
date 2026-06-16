/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

// NOTE: In a Convex deployment the CLI generates this file to import the
// function modules directly. Here we build opaque function references via
// `makeFunctionReference`, because the Next.js bundler cannot resolve the
// `.js` import specifiers to the `.ts` source files the Convex runtime
// compiles. Each reference is just a `{ [functionName]: "module:name" }`
// marker the Convex client sends to the backend — the function bodies never
// run in the Next bundle.

import { makeFunctionReference } from "convex/server";

const ref = (path) => makeFunctionReference(path);

const fullApi = {
  auth: {
    signIn: ref("auth:signIn"),
    signOut: ref("auth:signOut"),
    isAuthenticated: ref("auth:isAuthenticated"),
  },
  bets: {
    createBet: ref("bets:createBet"),
    placeWager: ref("bets:placeWager"),
    removeWager: ref("bets:removeWager"),
    resolveBet: ref("bets:resolveBet"),
    cancelBet: ref("bets:cancelBet"),
    getBet: ref("bets:getBet"),
    listActiveBets: ref("bets:listActiveBets"),
  },
  comments: {
    list: ref("comments:list"),
    add: ref("comments:add"),
    remove: ref("comments:remove"),
  },
  groups: {
    createGroup: ref("groups:createGroup"),
    joinGroup: ref("groups:joinGroup"),
    updateGroup: ref("groups:updateGroup"),
    leaveGroup: ref("groups:leaveGroup"),
    getGroup: ref("groups:getGroup"),
    listMyGroups: ref("groups:listMyGroups"),
  },
  http: {},
  profile: {
    getMe: ref("profile:getMe"),
    getProfileStats: ref("profile:getProfileStats"),
    updateProfile: ref("profile:updateProfile"),
    changePassword: ref("profile:changePassword"),
    deleteAccount: ref("profile:deleteAccount"),
    getPending: ref("profile:getPending"),
  },
  stripe: {
    stripeWebhook: ref("stripe:stripeWebhook"),
  },
  wallet: {
    topUp: ref("wallet:topUp"),
    completeTopUp: ref("wallet:completeTopUp"),
    creditTopUp: ref("wallet:creditTopUp"),
    listTransactions: ref("wallet:listTransactions"),
  },
  seed: {
    all: ref("seed:all"),
    wipe: ref("seed:wipe"),
    userIdByEmail: ref("seed:userIdByEmail"),
    setBalances: ref("seed:setBalances"),
    buildGraph: ref("seed:buildGraph"),
  },
};

export const api = fullApi;
export const internal = fullApi;
export const components = {};
