import { WebAppInitDataSchema } from "@rustigram/tma-core";
import type { ValidationResult } from "./validate-hmac";

const encoder = new TextEncoder();

// Telegram's published public keys — never change without a Telegram announcement.
const TELEGRAM_PUBLIC_KEYS: Record<"production" | "test", string> = {
  production: "e7bf03a2fa4602af4580703d88dda5bb59f32ed8b02a56c187fe7d34caed242d",
  test: "40055058a4ee38156a06562e52eece92a771bcd8346a8c4615cb7376eddf72ec",
};

function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes as Uint8Array<ArrayBuffer>;
}

function base64urlToBytes(base64url: string): Uint8Array<ArrayBuffer> {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const binary = atob(padded);
  return Uint8Array.from({ length: binary.length }, (_, i) => binary.charCodeAt(i)) as Uint8Array<ArrayBuffer>;
}

function buildEd25519DataCheckString(params: URLSearchParams, botId: number): string {
  const fields = [...params.entries()]
    .filter(([key]) => key !== "hash" && key !== "signature")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");
  return `${botId}:WebAppData\n${fields}`;
}

/** Lower-level verification — exported for testing with custom key pairs. */
export async function verifySignature(
  dataCheckString: string,
  signatureBase64url: string,
  publicKeyHex: string,
): Promise<boolean> {
  const publicKey = await crypto.subtle.importKey(
    "raw",
    hexToBytes(publicKeyHex),
    { name: "Ed25519" },
    false,
    ["verify"],
  );
  return crypto.subtle.verify(
    "Ed25519",
    publicKey,
    base64urlToBytes(signatureBase64url),
    encoder.encode(dataCheckString),
  );
}

export async function validateInitDataSignature(
  initData: string,
  botId: number,
  options: { env?: "production" | "test"; maxAgeSeconds?: number } = {},
): Promise<ValidationResult> {
  let params: URLSearchParams;
  try {
    params = new URLSearchParams(initData);
  } catch {
    return { ok: false, error: "parse_error" };
  }

  const signature = params.get("signature");
  if (!signature) return { ok: false, error: "invalid_hash" };

  const publicKeyHex = TELEGRAM_PUBLIC_KEYS[options.env ?? "production"];
  const dataCheckString = buildEd25519DataCheckString(params, botId);

  let valid: boolean;
  try {
    valid = await verifySignature(dataCheckString, signature, publicKeyHex);
  } catch {
    return { ok: false, error: "invalid_hash" };
  }

  if (!valid) return { ok: false, error: "invalid_hash" };

  if (options.maxAgeSeconds !== undefined) {
    const authDate = Number(params.get("auth_date") ?? "0");
    if (Math.floor(Date.now() / 1000) - authDate > options.maxAgeSeconds) {
      return { ok: false, error: "expired" };
    }
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
