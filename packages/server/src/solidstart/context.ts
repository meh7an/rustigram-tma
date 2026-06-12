import type { WebAppInitData, WebAppUser } from "@rustigram/tma-core";

const INIT_DATA_KEY = "tmaInitData";
const USER_KEY = "tmaUser";

interface EventWithLocals {
  locals: Record<string, unknown>;
}

/**
 * Attach validated `WebAppInitData` to `event.locals` after a successful
 * HMAC-SHA256 or Ed25519 validation. Also attaches `data.user` separately
 * for convenient access via `getTmaUser()`.
 *
 * Called internally by `createTmaMiddleware()` — you typically don't need
 * to call this directly unless you are building a custom middleware.
 *
 * @param event - A SolidStart request event with a `locals` map.
 * @param data  - The validated `WebAppInitData` to store.
 */
export function setTmaLocals(event: EventWithLocals, data: WebAppInitData): void {
  event.locals[INIT_DATA_KEY] = data;
  if (data.user) event.locals[USER_KEY] = data.user;
}

/**
 * Retrieve the validated `WebAppInitData` from `event.locals`.
 *
 * Throws if `createTmaMiddleware()` has not run for this route — this is
 * always a programming error and should surface immediately in development.
 *
 * @param event - A SolidStart request event with a `locals` map.
 *
 * @example
 * // In a SolidStart server function or API route:
 * import { getTmaInitData } from "@rustigram/tma-server/solidstart";
 *
 * export const getUser = query(async () => {
 *   "use server";
 *   const initData = getTmaInitData(getRequestEvent()!);
 *   return initData.user;
 * }, "getUser");
 */
export function getTmaInitData(event: EventWithLocals): WebAppInitData {
  const data = event.locals[INIT_DATA_KEY];
  if (!data) {
    throw new Error(
      "tmaInitData not found in event.locals. " +
      "Ensure createTmaMiddleware() is registered for this route.",
    );
  }
  return data as WebAppInitData;
}

/**
 * Retrieve the validated `WebAppUser` from `event.locals`.
 *
 * Throws if `createTmaMiddleware()` has not run for this route, or if the
 * validated `initData` did not include a `user` field (e.g. launched from
 * a keyboard button).
 *
 * @param event - A SolidStart request event with a `locals` map.
 *
 * @example
 * // In a SolidStart server function or API route:
 * import { getTmaUser } from "@rustigram/tma-server/solidstart";
 *
 * export const getUser = query(async () => {
 *   "use server";
 *   const user = getTmaUser(getRequestEvent()!);
 *   return { id: user.id, name: user.first_name };
 * }, "getUser");
 */
export function getTmaUser(event: EventWithLocals): WebAppUser {
  const user = event.locals[USER_KEY];
  if (!user) {
    throw new Error(
      "tmaUser not found in event.locals. " +
      "Ensure createTmaMiddleware() is active and initData includes a user field.",
    );
  }
  return user as WebAppUser;
}