import { validateInitData } from "../validate-hmac";
import { setTmaLocals } from "./context";

interface RequestEventLike {
  request: Request;
  locals: Record<string, unknown>;
}

/**
 * Creates a SolidStart v2 `onRequest` middleware handler that validates the
 * `X-Telegram-Init-Data` request header using HMAC-SHA256 and attaches the
 * parsed `WebAppInitData` and `WebAppUser` to `event.locals`.
 *
 * Returns a `401 Unauthorized` response if the header is missing, the hash
 * is invalid, or the data has expired. On success, the validated data is
 * available in subsequent server functions via `getTmaInitData()` and
 * `getTmaUser()`.
 *
 * @param botToken - The bot token from `@BotFather`. Keep this secret —
 *   never expose it to the client. Typically `process.env.BOT_TOKEN`.
 * @param options - Optional middleware configuration.
 *
 * @example
 * // src/middleware.ts
 * import { createMiddleware } from "@solidjs/start/middleware";
 * import { createTmaMiddleware } from "@rustigram/tma-server/solidstart";
 *
 * export default createMiddleware({
 *   onRequest: [
 *     createTmaMiddleware(process.env.BOT_TOKEN!, { maxAgeSeconds: 3600 }),
 *   ],
 * });
 *
 * @example
 * // src/routes/index.tsx — reading validated data in a server function
 * import { getTmaUser } from "@rustigram/tma-server/solidstart";
 * import { getRequestEvent } from "solid-js/web";
 *
 * export const getProfile = query(async () => {
 *   "use server";
 *   const user = getTmaUser(getRequestEvent()!);
 *   return { id: user.id, name: user.first_name };
 * }, "getProfile");
 */
export function createTmaMiddleware(
  botToken: string,
  options: {
    /** The request header to read `initData` from. Defaults to `"X-Telegram-Init-Data"`. */
    headerName?: string;
    /** Reject `initData` older than this many seconds. Recommended: `3600`. */
    maxAgeSeconds?: number;
  } = {},
) {
  const headerName = options.headerName ?? "X-Telegram-Init-Data";

  return async (event: RequestEventLike): Promise<Response | void> => {
    const initDataRaw = event.request.headers.get(headerName);

    if (!initDataRaw) {
      return new Response("Missing Telegram initData header.", { status: 401 });
    }

    const result = await validateInitData(
      initDataRaw,
      botToken,
      options.maxAgeSeconds !== undefined ? { maxAgeSeconds: options.maxAgeSeconds } : {},
    );

    if (!result.ok) {
      return new Response("Invalid Telegram initData.", { status: 401 });
    }

    setTmaLocals(event, result.data);
  };
}