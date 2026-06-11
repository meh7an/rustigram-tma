import { validateInitData } from "../validate-hmac";
import { setTmaLocals } from "./context";

interface RequestEventLike {
  request: Request;
  locals: Record<string, unknown>;
}

/**
 * Creates a SolidStart v2 onRequest middleware handler that validates the
 * `X-Telegram-Init-Data` header using HMAC-SHA256 and attaches the parsed
 * user and initData to `event.locals`.
 *
 * Usage in src/middleware.ts:
 * ```ts
 * import { createMiddleware } from "@solidjs/start/middleware";
 * import { createTmaMiddleware } from "@rustigram/tma-server/solidstart";
 *
 * export default createMiddleware({
 *   onRequest: [createTmaMiddleware(process.env.BOT_TOKEN!)],
 * });
 * ```
 */
export function createTmaMiddleware(
  botToken: string,
  options: {
    headerName?: string;
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
