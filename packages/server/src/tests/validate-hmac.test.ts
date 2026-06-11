import { describe, expect, it } from "vitest";
import { validateInitData } from "../validate-hmac";
import { buildValidHmacInitData } from "./helpers";

const BOT_TOKEN = "123456789:test-bot-token-for-unit-tests";
const TEST_USER = { id: 42, first_name: "Mehran" };

describe("validateInitData", () => {
  it("returns ok: true for valid initData", async () => {
    const initData = await buildValidHmacInitData(BOT_TOKEN, TEST_USER);
    const result = await validateInitData(initData, BOT_TOKEN);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.user?.first_name).toBe("Mehran");
    }
  });

  it("returns invalid_hash for a tampered hash", async () => {
    const initData = await buildValidHmacInitData(BOT_TOKEN, TEST_USER);
    const tampered = initData.replace(/hash=[^&]+/, "hash=deadbeef");
    const result = await validateInitData(tampered, BOT_TOKEN);
    expect(result).toEqual({ ok: false, error: "invalid_hash" });
  });

  it("returns invalid_hash when hash field is absent", async () => {
    const result = await validateInitData("auth_date=1234&user=%7B%7D", BOT_TOKEN);
    expect(result).toEqual({ ok: false, error: "invalid_hash" });
  });

  it("returns invalid_hash when the bot token is wrong", async () => {
    const initData = await buildValidHmacInitData(BOT_TOKEN, TEST_USER);
    const result = await validateInitData(initData, "wrong-token");
    expect(result).toEqual({ ok: false, error: "invalid_hash" });
  });

  it("returns expired when auth_date exceeds maxAgeSeconds", async () => {
    const staleDate = Math.floor(Date.now() / 1000) - 7200;
    const initData = await buildValidHmacInitData(BOT_TOKEN, TEST_USER, staleDate);
    const result = await validateInitData(initData, BOT_TOKEN, { maxAgeSeconds: 3600 });
    expect(result).toEqual({ ok: false, error: "expired" });
  });

  it("accepts initData within the maxAgeSeconds window", async () => {
    const initData = await buildValidHmacInitData(BOT_TOKEN, TEST_USER);
    const result = await validateInitData(initData, BOT_TOKEN, { maxAgeSeconds: 3600 });
    expect(result.ok).toBe(true);
  });
});
