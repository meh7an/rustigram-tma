import { describe, expect, it, vi } from "vitest";

import { createAccelerometer } from "../accelerometer";
import { createBiometricManager } from "../biometric";
import { createLocationManager } from "../location";
import { TmaSensorError } from "../../errors";
import { initBridge } from "../../bridge/tma-bridge";
import { buildMockWebApp } from "../../__fixtures__/mock-web-app";
import type { TelegramAccelerometer, TelegramBiometricManager, TelegramLocationManager } from "../../types/telegram";

function makeMockAccelerometer(overrides: Partial<TelegramAccelerometer> = {}): TelegramAccelerometer {
  const s = {
    isStarted: false,
    x: 0, y: 0, z: 0,
    start: vi.fn((_, cb) => { cb?.(true); return s; }),
    stop: vi.fn((cb) => { cb?.(true); return s; }),
    ...overrides,
  } as unknown as TelegramAccelerometer;
  return s;
}

describe("createAccelerometer", () => {
  it("start resolves when the sensor starts successfully", async () => {
    const mockWebApp = buildMockWebApp();
    const bridge = initBridge({ mockWebApp, skipReady: true });
    const sensor = makeMockAccelerometer();
    await expect(createAccelerometer(bridge, sensor).start()).resolves.toBeUndefined();
    bridge.off("accelerometerChanged", vi.fn());
  });

  it("start rejects with TmaSensorError when started is false", async () => {
    const mockWebApp = buildMockWebApp();
    const bridge = initBridge({ mockWebApp, skipReady: true });
    const sensor = makeMockAccelerometer({
      start: vi.fn((_, cb) => { cb?.(false); return sensor; }),
    });
    await expect(createAccelerometer(bridge, sensor).start()).rejects.toBeInstanceOf(TmaSensorError);
  });

  it("subscribe callback fires when accelerometerChanged event emits", () => {
    const mockWebApp = buildMockWebApp();
    const bridge = initBridge({ mockWebApp, skipReady: true });
    const sensor = makeMockAccelerometer();
    (sensor as { isStarted: boolean }).isStarted = true;
    (sensor as { x: number }).x = 1.5;
    (sensor as { y: number }).y = -0.5;
    (sensor as { z: number }).z = 9.8;

    const acc = createAccelerometer(bridge, sensor);
    const listener = vi.fn();
    acc.subscribe(listener);

    mockWebApp.__emit("accelerometerChanged", undefined);
    expect(listener).toHaveBeenCalledWith({ x: 1.5, y: -0.5, z: 9.8 });
    acc.destroy();
  });

  it("getData returns null when sensor is not started", () => {
    const mockWebApp = buildMockWebApp();
    const bridge = initBridge({ mockWebApp, skipReady: true });
    const acc = createAccelerometer(bridge, makeMockAccelerometer());
    expect(acc.getData()).toBeNull();
    acc.destroy();
  });

  it("destroy stops subscriber callbacks from firing", () => {
    const mockWebApp = buildMockWebApp();
    const bridge = initBridge({ mockWebApp, skipReady: true });
    const acc = createAccelerometer(bridge, makeMockAccelerometer());
    const listener = vi.fn();

    acc.subscribe(listener);
    acc.destroy();
    mockWebApp.__emit("accelerometerChanged", undefined);
    expect(listener).not.toHaveBeenCalled();
  });
});

describe("createBiometricManager", () => {
  function makeMockBm(): TelegramBiometricManager {
    const bm = {
      isInited: true,
      isBiometricAvailable: true,
      biometricType: "finger" as const,
      isAccessRequested: false,
      isAccessGranted: false,
      isBiometricTokenSaved: false,
      deviceId: "device-001",
      init: vi.fn((cb) => { cb?.(); return bm; }),
      requestAccess: vi.fn((_, cb) => { cb?.(true); return bm; }),
      authenticate: vi.fn((_, cb) => { cb?.(true, "token-abc"); return bm; }),
      updateBiometricToken: vi.fn((_, cb) => { cb?.(true); return bm; }),
      openSettings: vi.fn(() => bm),
    } as unknown as TelegramBiometricManager;
    return bm;
  }

  it("init resolves after the callback fires", async () => {
    const mockWebApp = buildMockWebApp();
    const bridge = initBridge({ mockWebApp, skipReady: true });
    const bm = createBiometricManager(bridge, makeMockBm());
    await expect(bm.init()).resolves.toBeUndefined();
    bm.destroy();
  });

  it("requestAccess resolves with the granted boolean", async () => {
    const mockWebApp = buildMockWebApp();
    const bridge = initBridge({ mockWebApp, skipReady: true });
    const bm = createBiometricManager(bridge, makeMockBm());
    expect(await bm.requestAccess()).toBe(true);
    bm.destroy();
  });

  it("authenticate resolves with success and token", async () => {
    const mockWebApp = buildMockWebApp();
    const bridge = initBridge({ mockWebApp, skipReady: true });
    const result = await createBiometricManager(bridge, makeMockBm()).authenticate();
    expect(result.success).toBe(true);
    expect(result.token).toBe("token-abc");
  });

  it("getStatus returns a snapshot of the manager state", () => {
    const mockWebApp = buildMockWebApp();
    const bridge = initBridge({ mockWebApp, skipReady: true });
    const bm = createBiometricManager(bridge, makeMockBm());
    expect(bm.getStatus().biometricType).toBe("finger");
    expect(bm.getStatus().deviceId).toBe("device-001");
    bm.destroy();
  });
});

describe("createLocationManager", () => {
  function makeMockLm(data: Parameters<TelegramLocationManager["getLocation"]>[0] extends (d: infer D) => void ? D : never = null): TelegramLocationManager {
    const lm = {
      isInited: true,
      isLocationAvailable: true,
      isAccessRequested: true,
      isAccessGranted: true,
      init: vi.fn((cb) => { cb?.(); return lm; }),
      getLocation: vi.fn((cb) => { cb(data); return lm; }),
      openSettings: vi.fn(() => lm),
    } as unknown as TelegramLocationManager;
    return lm;
  }

  it("init resolves after callback fires", async () => {
    const mockWebApp = buildMockWebApp();
    const bridge = initBridge({ mockWebApp, skipReady: true });
    const lm = createLocationManager(bridge, makeMockLm());
    await expect(lm.init()).resolves.toBeUndefined();
    lm.destroy();
  });

  it("getLocation resolves with null when access is denied", async () => {
    const mockWebApp = buildMockWebApp();
    const bridge = initBridge({ mockWebApp, skipReady: true });
    const lm = createLocationManager(bridge, makeMockLm(null));
    expect(await lm.getLocation()).toBeNull();
    lm.destroy();
  });

  it("getStatus reflects the manager fields", () => {
    const mockWebApp = buildMockWebApp();
    const bridge = initBridge({ mockWebApp, skipReady: true });
    const lm = createLocationManager(bridge, makeMockLm());
    expect(lm.getStatus().isAccessGranted).toBe(true);
    lm.destroy();
  });
});
