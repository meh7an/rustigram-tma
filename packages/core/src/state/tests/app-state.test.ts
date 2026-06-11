import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createAppState } from "../app-state";
import { initBridge } from "../../bridge/tma-bridge";
import { buildMockWebApp } from "../../../__fixtures__/mock-web-app";

describe("createAppState", () => {
  it("getSnapshot returns initial state from the WebApp", () => {
    const mockWebApp = buildMockWebApp({ colorScheme: "dark" });
    const bridge = initBridge({ mockWebApp, skipReady: true });
    const appState = createAppState(bridge);

    expect(appState.getSnapshot().colorScheme).toBe("dark");
    appState.destroy();
  });

  it("getValue returns the value for a single key", () => {
    const mockWebApp = buildMockWebApp({ viewportHeight: 812 });
    const bridge = initBridge({ mockWebApp, skipReady: true });
    const appState = createAppState(bridge);

    expect(appState.getValue("viewportHeight")).toBe(812);
    appState.destroy();
  });

  it("subscribe fires when the relevant event updates the field", () => {
    const mockWebApp = buildMockWebApp({ colorScheme: "light" });
    const bridge = initBridge({ mockWebApp, skipReady: true });
    const appState = createAppState(bridge);
    const listener = vi.fn();

    appState.subscribe("colorScheme", listener);

    // Simulate Telegram firing themeChanged — update the mock's colorScheme
    // and trigger the event handler that was registered on the bridge.
    mockWebApp.colorScheme = "dark";
    mockWebApp.__emit("themeChanged", undefined);

    expect(listener).toHaveBeenCalledWith("dark");
    appState.destroy();
  });

  it("subscribe returns an unsubscribe function that stops future calls", () => {
    const mockWebApp = buildMockWebApp();
    const bridge = initBridge({ mockWebApp, skipReady: true });
    const appState = createAppState(bridge);
    const listener = vi.fn();

    const unsubscribe = appState.subscribe("colorScheme", listener);
    unsubscribe();

    mockWebApp.colorScheme = "dark";
    mockWebApp.__emit("themeChanged", undefined);

    expect(listener).not.toHaveBeenCalled();
    appState.destroy();
  });

  it("viewportStableHeight only updates when isStateStable is true", () => {
    const mockWebApp = buildMockWebApp({ viewportStableHeight: 800 });
    const bridge = initBridge({ mockWebApp, skipReady: true });
    const appState = createAppState(bridge);

    mockWebApp.viewportHeight = 600;
    mockWebApp.viewportStableHeight = 600;
    mockWebApp.__emit("viewportChanged", { isStateStable: false });
    expect(appState.getValue("viewportStableHeight")).toBe(800);

    mockWebApp.__emit("viewportChanged", { isStateStable: true });
    expect(appState.getValue("viewportStableHeight")).toBe(600);
    appState.destroy();
  });

  it("destroy removes all event listeners and clears subscribers", () => {
    const mockWebApp = buildMockWebApp();
    const bridge = initBridge({ mockWebApp, skipReady: true });
    const appState = createAppState(bridge);
    const listener = vi.fn();

    appState.subscribe("colorScheme", listener);
    appState.destroy();

    mockWebApp.colorScheme = "dark";
    mockWebApp.__emit("themeChanged", undefined);

    expect(listener).not.toHaveBeenCalled();
  });

  describe("CSS variable injection", () => {
    beforeEach(() => {
      document.documentElement.style.cssText = "";
    });

    afterEach(() => {
      document.documentElement.style.cssText = "";
    });

    it("injects theme CSS vars on init", () => {
      const mockWebApp = buildMockWebApp({
        themeParams: { bg_color: "#1c1c1d", button_color: "#2481cc" },
      });
      const bridge = initBridge({ mockWebApp, skipReady: true });
      const appState = createAppState(bridge);

      const root = document.documentElement;
      expect(root.style.getPropertyValue("--tg-theme-bg-color")).toBe("#1c1c1d");
      expect(root.style.getPropertyValue("--tg-theme-button-color")).toBe("#2481cc");
      appState.destroy();
    });

    it("updates CSS vars when themeChanged fires", () => {
      const mockWebApp = buildMockWebApp({ themeParams: { bg_color: "#ffffff" } });
      const bridge = initBridge({ mockWebApp, skipReady: true });
      const appState = createAppState(bridge);

      mockWebApp.themeParams = { bg_color: "#000000" };
      mockWebApp.__emit("themeChanged", undefined);

      expect(document.documentElement.style.getPropertyValue("--tg-theme-bg-color")).toBe(
        "#000000",
      );
      appState.destroy();
    });
  });
});
