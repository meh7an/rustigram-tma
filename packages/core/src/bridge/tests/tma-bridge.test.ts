import { describe, expect, it, vi } from "vitest";

import { initBridge, isTelegramAvailable, TmaBridgeError } from "../tma-bridge";
import { buildMockWebApp } from "../../__fixtures__/mock-web-app";

describe("isTelegramAvailable", () => {
  it("returns false when window.Telegram is not set", () => {
    expect(isTelegramAvailable()).toBe(false);
  });
});

describe("initBridge", () => {
  it("throws TmaBridgeError when no WebApp is available and no mock provided", () => {
    expect(() => initBridge()).toThrow(TmaBridgeError);
  });

  it("uses mockWebApp when provided", () => {
    const mockWebApp = buildMockWebApp();
    const bridge = initBridge({ mockWebApp, skipReady: true });
    expect(bridge.webApp).toBe(mockWebApp);
  });

  it("calls ready() on the WebApp by default", () => {
    const mockWebApp = buildMockWebApp();
    initBridge({ mockWebApp });
    expect(mockWebApp.ready).toHaveBeenCalledOnce();
  });

  it("skips ready() when skipReady is true", () => {
    const mockWebApp = buildMockWebApp();
    initBridge({ mockWebApp, skipReady: true });
    expect(mockWebApp.ready).not.toHaveBeenCalled();
  });

  it("populates launchContext from the WebApp", () => {
    const mockWebApp = buildMockWebApp({ version: "8.0", platform: "ios" });
    const bridge = initBridge({ mockWebApp, skipReady: true });
    expect(bridge.launchContext.version).toBe("8.0");
    expect(bridge.launchContext.platform).toBe("ios");
  });

  it("delegates on/off to webApp.onEvent/offEvent", () => {
    const mockWebApp = buildMockWebApp();
    const bridge = initBridge({ mockWebApp, skipReady: true });
    const handler = vi.fn();

    bridge.on("themeChanged", handler);
    expect(mockWebApp.onEvent).toHaveBeenCalledWith("themeChanged", handler);

    bridge.off("themeChanged", handler);
    expect(mockWebApp.offEvent).toHaveBeenCalledWith("themeChanged", handler);
  });

  it("isVersionAtLeast delegates to webApp", () => {
    const mockWebApp = buildMockWebApp({ version: "8.0" });
    const bridge = initBridge({ mockWebApp, skipReady: true });
    expect(bridge.isVersionAtLeast("8.0")).toBe(true);
    expect(bridge.isVersionAtLeast("9.0")).toBe(false);
  });
});
