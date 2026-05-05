/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai from "../ai.js";
import type * as clerkActions from "../clerkActions.js";
import type * as http from "../http.js";
import type * as lib_profileslug from "../lib/profileslug.js";
import type * as media from "../media.js";
import type * as mediaStore from "../mediaStore.js";
import type * as migrateProfilesRequiredFields from "../migrateProfilesRequiredFields.js";
import type * as onboarding from "../onboarding.js";
import type * as patchProfilesRequiredFields from "../patchProfilesRequiredFields.js";
import type * as patchUsersAccountType from "../patchUsersAccountType.js";
import type * as payments from "../payments.js";
import type * as profiles from "../profiles.js";
import type * as publicActions from "../publicActions.js";
import type * as ragChat from "../ragChat.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  clerkActions: typeof clerkActions;
  http: typeof http;
  "lib/profileslug": typeof lib_profileslug;
  media: typeof media;
  mediaStore: typeof mediaStore;
  migrateProfilesRequiredFields: typeof migrateProfilesRequiredFields;
  onboarding: typeof onboarding;
  patchProfilesRequiredFields: typeof patchProfilesRequiredFields;
  patchUsersAccountType: typeof patchUsersAccountType;
  payments: typeof payments;
  profiles: typeof profiles;
  publicActions: typeof publicActions;
  ragChat: typeof ragChat;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
