const encoder = new TextEncoder();

/** Generates a cryptographically valid HMAC-SHA256 initData string for testing. */
export async function buildValidHmacInitData(
  botToken: string,
  user: { id: number; first_name: string },
  authDate?: number,
): Promise<string> {
  const params = new URLSearchParams({
    user: JSON.stringify(user),
    auth_date: String(authDate ?? Math.floor(Date.now() / 1000)),
    query_id: "test_query_001",
  });

  const entries = [...params.entries()].sort(([a], [b]) => a.localeCompare(b));
  const dataCheckString = entries.map(([k, v]) => `${k}=${v}`).join("\n");

  const secretKeyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode("WebAppData"),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const secretKey = await crypto.subtle.sign(
    "HMAC",
    secretKeyMaterial,
    encoder.encode(botToken),
  );
  const hashKey = await crypto.subtle.importKey(
    "raw",
    secretKey,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const hashBytes = await crypto.subtle.sign("HMAC", hashKey, encoder.encode(dataCheckString));
  const hash = Array.from(new Uint8Array(hashBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  params.set("hash", hash);
  return params.toString();
}

/** Generates a signed Ed25519 initData + the public key hex for the generated key pair. */
export async function buildValidEd25519InitData(botId: number): Promise<{
  initData: string;
  publicKeyHex: string;
}> {
  const keyPair = await crypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"]);

  const params = new URLSearchParams({
    user: JSON.stringify({ id: 99999, first_name: "Test" }),
    auth_date: String(Math.floor(Date.now() / 1000)),
  });

  const fields = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");
  const dataCheckString = `${botId}:WebAppData\n${fields}`;

  const sigBytes = await crypto.subtle.sign("Ed25519", keyPair.privateKey, encoder.encode(dataCheckString));
  const signature = btoa(String.fromCharCode(...new Uint8Array(sigBytes)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
  params.set("signature", signature);

  const pubKeyBytes = await crypto.subtle.exportKey("raw", keyPair.publicKey);
  const publicKeyHex = Array.from(new Uint8Array(pubKeyBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return { initData: params.toString(), publicKeyHex };
}
