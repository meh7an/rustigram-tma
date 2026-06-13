import { validateInitData } from "../validate-hmac";
import { parseInitData, verifyGatewayHeader } from "../parse-init-data";
import { setTmaLocals } from "./context";

interface RequestEventLike {
  request: Request;
  locals: Record<string, unknown>;
}

/**
 * Creates a SolidStart v2 `onRequest` middleware handler that validates or
 * parses the `X-Telegram-Init-Data` request header and attaches the result
 * to `event.locals`.
 *
 * ## Validation mode (`botToken: string`)
 *
 * Validates the initData using HMAC-SHA256 against the bot token. Returns
 * `401 Unauthorized` if the header is missing, the hash is invalid, or the
 * data has expired. Use this when SolidStart is the outermost server.
 *
 * ```ts
 * createTmaMiddleware(process.env.BOT_TOKEN!, { maxAgeSeconds: 3600 })
 * ```
 *
 * ## Parse-only mode (`botToken: null`)
 *
 * Skips HMAC validation and only parses the initData for type-safe access.
 * Use this when a trusted upstream layer — such as `rustigram-miniapp` — has
 * already validated the request before it reached SolidStart. In this mode,
 * no `BOT_TOKEN` is required in the TypeScript environment.
 *
 * **Security:** only use `null` when SolidStart is not directly
 * internet-accessible (i.e. it sits behind the Rust gateway).
 *
 * ```ts
 * // No BOT_TOKEN needed — Rust already validated.
 * createTmaMiddleware(null)
 * ```
 *
 * @param botToken - Bot token for HMAC validation, or `null` for parse-only
 *   mode when a trusted upstream has already validated.
 * @param options - Optional middleware configuration.
 *
 * @example
 * // src/middleware.ts — validation mode (TS-only stack)
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
 * // src/middleware.ts — parse-only mode (behind rustigram-miniapp gateway)
 * import { createMiddleware } from "@solidjs/start/middleware";
 * import { createTmaMiddleware } from "@rustigram/tma-server/solidstart";
 *
 * export default createMiddleware({
 *   onRequest: [createTmaMiddleware(null)],
 * });
 */
export function createTmaMiddleware(
  botToken: string | null,
  options: {
    /** The request header to read `initData` from. Defaults to `"X-Telegram-Init-Data"`. */
    headerName?: string;
    /** Reject `initData` older than this many seconds. Only applies in validation mode. */
    maxAgeSeconds?: number;
    gatewaySecret?: string;
  } = {},
) {
  const headerName = options.headerName ?? "X-Telegram-Init-Data";

  return async (event: RequestEventLike): Promise<Response | void> => {
    const initDataRaw = event.request.headers.get(headerName);

    if (!initDataRaw) {
      return new Response("Missing Telegram initData header.", { status: 401 });
    }

    if (botToken === null) {
      if (options.gatewaySecret) {
        const gatewayHeader = event.request.headers.get("x-tma-gateway");
        if (!gatewayHeader) {
          return new Response("Missing gateway header.", { status: 401 });
        }
        const valid = await verifyGatewayHeader(
          initDataRaw,
          gatewayHeader,
          options.gatewaySecret,
        );
        if (!valid) {
          return new Response("Invalid gateway header.", { status: 401 });
        }
      }
      const result = parseInitData(initDataRaw);
      if (!result.ok) {
        return new Response("Malformed Telegram initData.", { status: 400 });
      }
      setTmaLocals(event, result.data);
      return;
    }

    // Validation mode: full HMAC-SHA256 check against the bot token.
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