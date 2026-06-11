import { describe, expect, it, vi } from "vitest";

import { createCloudStorage, createDeviceStorage, createSecureStorage } from "../index";
import { TmaStorageError } from "../../errors";
import type { TelegramCloudStorage, TelegramDeviceStorage, TelegramSecureStorage } from "../../types/telegram";

// ─── CloudStorage ─────────────────────────────────────────────────────────────

describe("createCloudStorage", () => {
  function makeCs(overrides: Partial<TelegramCloudStorage> = {}): TelegramCloudStorage {
    const cs: TelegramCloudStorage = {
      getItem: vi.fn((_, cb) => { cb(null, undefined); return cs; }),
      setItem: vi.fn((_, __, cb) => { cb?.(null, true); return cs; }),
      getItems: vi.fn((_, cb) => { cb(null, {}); return cs; }),
      removeItem: vi.fn((_, cb) => { cb?.(null, true); return cs; }),
      removeItems: vi.fn((_, cb) => { cb?.(null, true); return cs; }),
      getKeys: vi.fn((cb) => { cb(null, []); return cs; }),
      ...overrides,
    };
    return cs;
  }

  it("getItem resolves with the stored value", async () => {
    const cs = makeCs({ getItem: vi.fn((_, cb) => { cb(null, "hello"); return cs; }) });
    expect(await createCloudStorage(cs).getItem("k")).toBe("hello");
  });

  it("getItem resolves with null when key is absent", async () => {
    const cs = makeCs({ getItem: vi.fn((_, cb) => { cb(null, undefined); return cs; }) });
    expect(await createCloudStorage(cs).getItem("k")).toBeNull();
  });

  it("getItem rejects with TmaStorageError on error", async () => {
    const cs = makeCs({ getItem: vi.fn((_, cb) => { cb("quota exceeded"); return cs; }) });
    await expect(createCloudStorage(cs).getItem("k")).rejects.toBeInstanceOf(TmaStorageError);
  });

  it("setItem resolves on success", async () => {
    const cs = makeCs();
    await expect(createCloudStorage(cs).setItem("k", "v")).resolves.toBeUndefined();
  });

  it("getItems maps missing keys to null", async () => {
    const cs = makeCs({
      getItems: vi.fn((_, cb) => { cb(null, { a: "1" }); return cs; }),
    });
    const result = await createCloudStorage(cs).getItems(["a", "b"]);
    expect(result["a"]).toBe("1");
    expect(result["b"]).toBeNull();
  });

  it("getKeys resolves with the key array", async () => {
    const cs = makeCs({
      getKeys: vi.fn((cb) => { cb(null, ["x", "y"]); return cs; }),
    });
    expect(await createCloudStorage(cs).getKeys()).toEqual(["x", "y"]);
  });
});

// ─── DeviceStorage ────────────────────────────────────────────────────────────

describe("createDeviceStorage", () => {
  function makeDs(): TelegramDeviceStorage {
    const ds: TelegramDeviceStorage = {
      getItem: vi.fn((_, cb) => { cb(null, "val"); return ds; }),
      setItem: vi.fn((_, __, cb) => { cb?.(null, true); return ds; }),
      removeItem: vi.fn((_, cb) => { cb?.(null, true); return ds; }),
      clear: vi.fn((cb) => { cb?.(null, true); return ds; }),
    };
    return ds;
  }

  it("getItem resolves with the stored value", async () => {
    expect(await createDeviceStorage(makeDs()).getItem("k")).toBe("val");
  });

  it("clear resolves on success", async () => {
    await expect(createDeviceStorage(makeDs()).clear()).resolves.toBeUndefined();
  });
});

// ─── SecureStorage ────────────────────────────────────────────────────────────

describe("createSecureStorage", () => {
  function makeSs(): TelegramSecureStorage {
    const ss: TelegramSecureStorage = {
      getItem: vi.fn((_, cb) => { cb(null, null, false); return ss; }),
      setItem: vi.fn((_, __, cb) => { cb?.(null, true); return ss; }),
      restoreItem: vi.fn((_, cb) => { cb(null, "restored"); return ss; }),
      removeItem: vi.fn((_, cb) => { cb?.(null, true); return ss; }),
      clear: vi.fn((cb) => { cb?.(null, true); return ss; }),
    };
    return ss;
  }

  it("getItem includes canRestore in the result", async () => {
    const ss = makeSs();
    vi.mocked(ss.getItem).mockImplementation((_, cb) => { cb(null, "secret", true); return ss; });
    const result = await createSecureStorage(ss).getItem("k");
    expect(result.value).toBe("secret");
    expect(result.canRestore).toBe(true);
  });

  it("getItem returns null value with canRestore false for unknown key", async () => {
    const result = await createSecureStorage(makeSs()).getItem("missing");
    expect(result.value).toBeNull();
    expect(result.canRestore).toBe(false);
  });

  it("restoreItem resolves with the restored value", async () => {
    expect(await createSecureStorage(makeSs()).restoreItem("k")).toBe("restored");
  });
});
