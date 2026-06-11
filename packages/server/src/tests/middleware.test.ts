import { describe, expect, it } from "vitest";
import { createTmaMiddleware } from "../solidstart/middleware";
import { getTmaUser, getTmaInitData } from "../solidstart/context";
import { buildValidHmacInitData } from "./helpers";

const BOT_TOKEN = "987654321:test-middleware-token";
const TEST_USER = { id: 777, first_name: "Mehran" };

function makeEvent(headers: Record<string, string> = {}) {
  return {
    request: new Request("https://example.com", { headers }),
    locals: {} as Record<string, unknown>,
  };
}

describe("createTmaMiddleware", () => {
  it("returns 401 when the initData header is missing", async () => {
    const middleware = createTmaMiddleware(BOT_TOKEN);
    const response = await middleware(makeEvent());
    expect(response?.status).toBe(401);
  });

  it("returns 401 for an invalid hash", async () => {
    const middleware = createTmaMiddleware(BOT_TOKEN);
    const event = makeEvent({ "X-Telegram-Init-Data": "auth_date=1234&hash=badhash" });
    const response = await middleware(event);
    expect(response?.status).toBe(401);
  });

  it("returns 401 when the token is wrong", async () => {
    const initData = await buildValidHmacInitData(BOT_TOKEN, TEST_USER);
    const middleware = createTmaMiddleware("wrong-token");
    const response = await middleware(makeEvent({ "X-Telegram-Init-Data": initData }));
    expect(response?.status).toBe(401);
  });

  it("returns undefined and attaches locals for valid initData", async () => {
    const initData = await buildValidHmacInitData(BOT_TOKEN, TEST_USER);
    const middleware = createTmaMiddleware(BOT_TOKEN);
    const event = makeEvent({ "X-Telegram-Init-Data": initData });

    const response = await middleware(event);

    expect(response).toBeUndefined();
    expect(event.locals.tmaUser).toBeDefined();
  });

  it("populates tmaUser with the correct first_name", async () => {
    const initData = await buildValidHmacInitData(BOT_TOKEN, TEST_USER);
    const middleware = createTmaMiddleware(BOT_TOKEN);
    const event = makeEvent({ "X-Telegram-Init-Data": initData });
    await middleware(event);

    const user = getTmaUser(event);
    expect(user.first_name).toBe("Mehran");
    expect(user.id).toBe(777);
  });

  it("respects a custom header name", async () => {
    const initData = await buildValidHmacInitData(BOT_TOKEN, TEST_USER);
    const middleware = createTmaMiddleware(BOT_TOKEN, { headerName: "X-Custom-Init" });
    const event = makeEvent({ "X-Custom-Init": initData });

    const response = await middleware(event);
    expect(response).toBeUndefined();
  });
});

describe("getTmaInitData / getTmaUser", () => {
  it("getTmaInitData throws when not set", () => {
    expect(() => getTmaInitData(makeEvent())).toThrow();
  });

  it("getTmaUser throws when not set", () => {
    expect(() => getTmaUser(makeEvent())).toThrow();
  });
});
