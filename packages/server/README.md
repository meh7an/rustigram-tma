# @rustigram/tma-server

Server-side initData validation for Telegram Mini Apps.
Uses the Web Crypto API (`globalThis.crypto.subtle`) exclusively — runs in Node 22+, Deno, Cloudflare Workers, and any edge runtime without polyfills.

```bash
pnpm add @rustigram/tma-server @rustigram/tma-core
```

## Validation

Two validation strategies — pick based on what you have:

| Strategy    | Requires    | Use when                   |
| ----------- | ----------- | -------------------------- |
| HMAC-SHA256 | Bot token   | You control the bot        |
| Ed25519     | Bot ID only | Third-party / no bot token |

### HMAC-SHA256

```typescript
import { validateInitData } from "@rustigram/tma-server";

const result = await validateInitData(initDataString, process.env.BOT_TOKEN!, {
  maxAgeSeconds: 3600, // reject sessions older than 1 hour
});

if (!result.ok) {
  // result.error: "invalid_hash" | "expired" | "parse_error"
  return new Response("Unauthorized", { status: 401 });
}

const { user, auth_date, query_id } = result.data; // result.data: WebAppInitData
```

### Ed25519 (third-party)

```typescript
import { validateInitDataSignature } from "@rustigram/tma-server";

const result = await validateInitDataSignature(initDataString, botId, {
  env: "production", // "production" | "test"
  maxAgeSeconds: 3600,
});
```

Public keys are hardcoded — Telegram's official published keys:

- Production: `e7bf03a2fa4602af4580703d88dda5bb59f32ed8b02a56c187fe7d34caed242d`
- Test: `40055058a4ee38156a06562e52eece92a771bcd8346a8c4615cb7376eddf72ec`

## SolidStart v2 Middleware

```typescript
// src/middleware.ts
import { createMiddleware } from "@solidjs/start/middleware";
import { createTmaMiddleware } from "@rustigram/tma-server/solidstart";

export default createMiddleware({
  onRequest: process.env["BOT_TOKEN"] ? [createTmaMiddleware(process.env["BOT_TOKEN"])] : [], // skip validation in local dev when token not set
});
```

Register in `vite.config.ts`:

```typescript
solidStart({ ssr: false, middleware: "./src/middleware.ts" });
```

**Client-side** — send initData with every request:

```typescript
const { bridge } = useTma();

fetch("/api/endpoint", {
  headers: { "X-Telegram-Init-Data": bridge.webApp.initData },
});
```

**Custom header or expiry:**

```typescript
createTmaMiddleware(botToken, {
  headerName: "X-My-Init-Data", // default: "X-Telegram-Init-Data"
  maxAgeSeconds: 1800,
});
```

## Reading Context in Server Functions

```typescript
import { getTmaUser, getTmaInitData } from "@rustigram/tma-server/solidstart";
import { getRequestEvent } from "solid-js/web";

async function getUser() {
  "use server";
  const event = getRequestEvent();
  return getTmaUser(event!); // WebAppUser — throws if middleware not active
}

async function getInitData() {
  "use server";
  const event = getRequestEvent();
  return getTmaInitData(event!); // WebAppInitData
}
```

Both throw with a descriptive message if the middleware didn't run or validation failed.

## Framework-agnostic (Hono, Express, etc.)

`validateInitData` is a plain async function with no framework coupling:

```typescript
import { validateInitData } from "@rustigram/tma-server";

// Hono
app.use("/api/*", async (c, next) => {
  const initData = c.req.header("X-Telegram-Init-Data") ?? "";
  const result = await validateInitData(initData, process.env.BOT_TOKEN!);
  if (!result.ok) return c.json({ error: result.error }, 401);
  c.set("tmaUser", result.data.user);
  await next();
});
```

## Requirements

- Node.js ≥ 22.12, Deno ≥ 1.40, or any runtime with `globalThis.crypto.subtle`
- `@rustigram/tma-core` (peer dependency — for shared types)
