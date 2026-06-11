import { describe, expect, it, vi } from "vitest";

import { createTmaMock } from "../create-mock";
import { initBridge } from "../../bridge/tma-bridge";
import { createAppState } from "../../state/app-state";
import { createCloudStorage } from "../../storage/cloud-storage";
import { createAccelerometer } from "../../sensors/accelerometer";

describe("createTmaMock — defaults", () => {
  it("has the correct default scalar state", () => {
    const { webApp } = createTmaMock();
    expect(webApp.version).toBe("8.0");
    expect(webApp.platform).toBe("unknown");
    expect(webApp.colorScheme).toBe("light");
    expect(webApp.isActive).toBe(true);
    expect(webApp.isFullscreen).toBe(false);
  });

  it("respects config overrides", () => {
    const { webApp } = createTmaMock({ version: "9.1", colorScheme: "dark", viewportHeight: 812 });
    expect(webApp.version).toBe("9.1");
    expect(webApp.colorScheme).toBe("dark");
    expect(webApp.viewportHeight).toBe(812);
  });

  it("isVersionAtLeast works correctly", () => {
    const { webApp } = createTmaMock({ version: "8.0" });
    expect(webApp.isVersionAtLeast("7.0")).toBe(true);
    expect(webApp.isVersionAtLeast("8.0")).toBe(true);
    expect(webApp.isVersionAtLeast("9.0")).toBe(false);
  });
});

describe("createTmaMock — events", () => {
  it("emit triggers registered onEvent handlers", () => {
    const mock = createTmaMock();
    const handler = vi.fn();
    mock.webApp.onEvent("themeChanged", handler);
    mock.emit("themeChanged", undefined);
    expect(handler).toHaveBeenCalledOnce();
  });

  it("emit passes typed payload to the handler", () => {
    const mock = createTmaMock();
    const handler = vi.fn();
    mock.webApp.onEvent("viewportChanged", handler);
    mock.emit("viewportChanged", { isStateStable: true });
    expect(handler).toHaveBeenCalledWith({ isStateStable: true });
  });

  it("offEvent removes the handler", () => {
    const mock = createTmaMock();
    const handler = vi.fn();
    mock.webApp.onEvent("themeChanged", handler);
    mock.webApp.offEvent("themeChanged", handler);
    mock.emit("themeChanged", undefined);
    expect(handler).not.toHaveBeenCalled();
  });
});

describe("createTmaMock — buttons", () => {
  it("BackButton.show/hide tracks isVisible", () => {
    const { webApp } = createTmaMock();
    expect(webApp.BackButton.isVisible).toBe(false);
    webApp.BackButton.show();
    expect(webApp.BackButton.isVisible).toBe(true);
    webApp.BackButton.hide();
    expect(webApp.BackButton.isVisible).toBe(false);
  });

  it("MainButton.setParams updates text and color", () => {
    const { webApp } = createTmaMock();
    webApp.MainButton.setParams({ text: "Pay", color: "#00ff00" });
    expect(webApp.MainButton.text).toBe("Pay");
    expect(webApp.MainButton.color).toBe("#00ff00");
  });

  it("MainButton.showProgress sets isProgressVisible", () => {
    const { webApp } = createTmaMock();
    webApp.MainButton.showProgress();
    expect(webApp.MainButton.isProgressVisible).toBe(true);
    webApp.MainButton.hideProgress();
    expect(webApp.MainButton.isProgressVisible).toBe(false);
  });

  it("BackButton.onClick fires when backButtonClicked is emitted", () => {
    const mock = createTmaMock();
    const cb = vi.fn();
    mock.webApp.BackButton.onClick(cb);
    mock.emit("backButtonClicked", undefined);
    expect(cb).toHaveBeenCalledOnce();
  });
});

describe("createTmaMock — storage", () => {
  it("CloudStorage stores and retrieves in-memory", async () => {
    const mock = createTmaMock();
    const cloud = createCloudStorage(mock.webApp.CloudStorage);
    await cloud.setItem("name", "Mehran");
    expect(await cloud.getItem("name")).toBe("Mehran");
  });

  it("storage.cloud map is directly accessible", () => {
    const mock = createTmaMock();
    mock.storage.cloud.set("seed-key", "seed-value");
    let received: string | undefined;
    mock.webApp.CloudStorage.getItem("seed-key", (_, v) => { received = v; });
    expect(received).toBe("seed-value");
  });
});

describe("createTmaMock — sensors", () => {
  it("sensor x/y/z is readable via webApp and settable via mock.sensors", () => {
    const mock = createTmaMock();
    mock.sensors.accelerometer.x = 9.8;
    expect(mock.webApp.Accelerometer.x).toBe(9.8);
  });

  it("accelerometer integrates with createAccelerometer and emit", () => {
    const mock = createTmaMock();
    const bridge = initBridge({ mockWebApp: mock.webApp, skipReady: true });
    const acc = createAccelerometer(bridge);
    const listener = vi.fn();

    acc.subscribe(listener);
    mock.sensors.accelerometer.x = 1.0;
    mock.sensors.accelerometer.y = 2.0;
    mock.emit("accelerometerChanged", undefined);

    expect(listener).toHaveBeenCalledWith({ x: 1.0, y: 2.0, z: 0 });
    acc.destroy();
  });
});

describe("createTmaMock — biometric", () => {
  it("requestAccess resolves with configured grantAccess value", async () => {
    const mock = createTmaMock({ biometric: { grantAccess: false } });
    await mock.webApp.BiometricManager.init();
    let granted: boolean | undefined;
    mock.webApp.BiometricManager.requestAccess({}, (g) => { granted = g; });
    expect(granted).toBe(false);
  });

  it("authenticate resolves with configured token on success", () => {
    const mock = createTmaMock({ biometric: { authenticateSuccess: true, token: "abc-token" } });
    let token: string | undefined;
    mock.webApp.BiometricManager.authenticate({}, (_s, t) => { token = t; });
    expect(token).toBe("abc-token");
  });
});

describe("createTmaMock — location", () => {
  it("getLocation returns null when grantAccess is false", () => {
    const mock = createTmaMock({ location: { grantAccess: false } });
    mock.webApp.LocationManager.init();
    let result: unknown = "not-called";
    mock.webApp.LocationManager.getLocation((d) => { result = d; });
    expect(result).toBeNull();
  });

  it("getLocation returns configured coordinates", () => {
    const mock = createTmaMock({ location: { data: { latitude: 51.5, longitude: -0.1 } } });
    mock.webApp.LocationManager.init();
    let lat: number | undefined;
    mock.webApp.LocationManager.getLocation((d) => { lat = d?.latitude; });
    expect(lat).toBe(51.5);
  });
});

describe("createTmaMock — integration with bridge + state", () => {
  it("createAppState reads initial state from the mock", () => {
    const mock = createTmaMock({ colorScheme: "dark", viewportHeight: 900 });
    const bridge = initBridge({ mockWebApp: mock.webApp, skipReady: true });
    const appState = createAppState(bridge);

    expect(appState.getValue("colorScheme")).toBe("dark");
    expect(appState.getValue("viewportHeight")).toBe(900);
    appState.destroy();
  });

  it("emitting themeChanged updates appState subscribers", () => {
    const mock = createTmaMock({ colorScheme: "light" });
    const bridge = initBridge({ mockWebApp: mock.webApp, skipReady: true });
    const appState = createAppState(bridge);
    const listener = vi.fn();

    appState.subscribe("colorScheme", listener);
    // Simulate Telegram updating the theme
    (mock.webApp as { colorScheme: string }).colorScheme = "dark";
    mock.emit("themeChanged", undefined);

    expect(listener).toHaveBeenCalledWith("dark");
    appState.destroy();
  });
});

describe("createTmaMock — reset", () => {
  it("clears storage and event handlers", () => {
    const mock = createTmaMock();
    mock.storage.cloud.set("k", "v");
    const handler = vi.fn();
    mock.webApp.onEvent("themeChanged", handler);

    mock.reset();

    expect(mock.storage.cloud.size).toBe(0);
    mock.emit("themeChanged", undefined);
    expect(handler).not.toHaveBeenCalled();
  });

  it("resets button visibility", () => {
    const { webApp, reset } = createTmaMock();
    webApp.BackButton.show();
    expect(webApp.BackButton.isVisible).toBe(true);
    reset();
    expect(webApp.BackButton.isVisible).toBe(false);
  });

  it("resets sensor data", () => {
    const mock = createTmaMock();
    mock.sensors.accelerometer.x = 9.8;
    mock.reset();
    expect(mock.sensors.accelerometer.x).toBe(0);
    expect(mock.webApp.Accelerometer.x).toBe(0);
  });
});
