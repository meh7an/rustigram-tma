import { WebAppInitDataSchema } from "@rustigram/tma-core";

import type { ValidationResult } from "./validate-hmac";

/**
 * Parse a raw `initData` string into a typed `WebAppInitData` **without**
 * HMAC-SHA256 or Ed25519 validation.
 *
 * Use this when a trusted upstream layer — such as `rustigram-miniapp` — has
 * already validated the data before the request reached this server. Calling
 * this on data that has not been validated upstream is a security risk.
 *
 * The `hash` field must still be present; its value is not checked.
 *
 * @param initData - The raw `window.Telegram.WebApp.initData` string.
 *
 * @returns A `ValidationResult`. On `ok: true`, `data` is the parsed
 *   `WebAppInitData`. On `ok: false`, `error` is `"parse_error"`.
 *
 * @example
 * // Behind a rustigram-miniapp Axum gateway that already validated:
 * const result = parseInitData(rawInitData);
 * if (!result.ok) return new Response("Malformed initData", { status: 400 });
 * const { user } = result.data;
 */
export function parseInitData(initData: string): ValidationResult {
    let params: URLSearchParams;
    try {
        params = new URLSearchParams(initData);
    } catch {
        return { ok: false, error: "parse_error" };
    }

    // Require hash to be structurally present even though we don't verify it.
    if (!params.get("hash")) {
        return { ok: false, error: "parse_error" };
    }

    try {
        const raw: Record<string, unknown> = {};
        for (const [key, value] of params.entries()) {
            if (key === "user" || key === "chat" || key === "receiver") {
                raw[key] = JSON.parse(value);
            } else if (key === "auth_date" || key === "can_send_after") {
                raw[key] = Number(value);
            } else {
                raw[key] = value;
            }
        }
        const parsed = WebAppInitDataSchema.safeParse(raw);
        if (!parsed.success) return { ok: false, error: "parse_error" };
        return { ok: true, data: parsed.data };
    } catch {
        return { ok: false, error: "parse_error" };
    }
}

/**
 * Verify the `X-Tma-Gateway` HMAC header produced by `TmaGatewayLayer`
 * in `rustigram-miniapp`. Returns `true` when the signature is valid.
 *
 * @param initDataRaw  - The raw initData string from `X-Telegram-Init-Data`.
 * @param gatewayHeader - The value of the `X-Tma-Gateway` request header.
 * @param gatewaySecret - The shared secret set on `TmaGatewayLayer`.
 */
export async function verifyGatewayHeader(
    initDataRaw: string,
    gatewayHeader: string,
    gatewaySecret: string,
): Promise<boolean> {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(gatewaySecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
    );
    const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(initDataRaw));
    const expected = Array.from(new Uint8Array(sig))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    // Constant-time comparison
    if (expected.length !== gatewayHeader.length) return false;
    let diff = 0;
    for (let i = 0; i < expected.length; i++) {
        diff |= expected.charCodeAt(i) ^ gatewayHeader.charCodeAt(i);
    }
    return diff === 0;
}