import { WebAppInitDataSchema } from "@rustigram/tma-core";
import type { WebAppInitData } from "@rustigram/tma-core";

export type ValidationResult =
  | { ok: true; data: WebAppInitData }
  | { ok: false; error: "invalid_hash" | "expired" | "parse_error" };

const encoder = new TextEncoder();

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Constant-time comparison prevents timing attacks on hash verification.
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function hmacSha256(keyData: BufferSource, message: string): Promise<ArrayBuffer> {
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return crypto.subtle.sign("HMAC", key, encoder.encode(message));
}

function buildDataCheckString(params: URLSearchParams): string {
  return [...params.entries()]
    .filter(([key]) => key !== "hash")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");
}

function parseInitDataParams(params: URLSearchParams): Record<string, unknown> {
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
  return raw;
}

export async function validateInitData(
  initData: string,
  botToken: string,
  options: { maxAgeSeconds?: number } = {},
): Promise<ValidationResult> {
  let params: URLSearchParams;
  try {
    params = new URLSearchParams(initData);
  } catch {
    return { ok: false, error: "parse_error" };
  }

  const receivedHash = params.get("hash");
  if (!receivedHash) return { ok: false, error: "invalid_hash" };

  // secret_key = HMAC-SHA256(key="WebAppData", message=botToken)
  const secretKey = await hmacSha256(encoder.encode("WebAppData"), botToken);

  // hash = HMAC-SHA256(key=secret_key, message=data_check_string)
  const computedHash = toHex(await hmacSha256(secretKey, buildDataCheckString(params)));

  if (!timingSafeEqual(computedHash, receivedHash)) {
    return { ok: false, error: "invalid_hash" };
  }

  if (options.maxAgeSeconds !== undefined) {
    const authDate = Number(params.get("auth_date") ?? "0");
    if (Math.floor(Date.now() / 1000) - authDate > options.maxAgeSeconds) {
      return { ok: false, error: "expired" };
    }
  }

  try {
    const parsed = WebAppInitDataSchema.safeParse(parseInitDataParams(params));
    if (!parsed.success) return { ok: false, error: "parse_error" };
    return { ok: true, data: parsed.data };
  } catch {
    return { ok: false, error: "parse_error" };
  }
}
