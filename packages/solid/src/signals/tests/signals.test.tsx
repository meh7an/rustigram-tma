// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from "vitest";
import { render, cleanup } from "@solidjs/testing-library";
import { createTmaMock } from "@rustigram/tma-core/mock";
import type { Accessor } from "solid-js";
import { TmaProvider } from "../../provider/TmaProvider";
import { useColorScheme, useViewportHeight, useIsVersionAtLeast } from "../index";

afterEach(cleanup);

function renderInProvider<T>(
  mockOverrides: Parameters<typeof createTmaMock>[0],
  hook: () => T,
): { result: { value: T }; mock: ReturnType<typeof createTmaMock> } {
  const mock = createTmaMock(mockOverrides);
  const result = { value: undefined as T };

  render(() => (
    <TmaProvider options={{ mockWebApp: mock.webApp, skipReady: true }}>
      {(() => {
        result.value = hook();
        return null;
      })()}
    </TmaProvider>
  ));

  return { result, mock };
}

describe("useColorScheme", () => {
  it("returns initial colorScheme from mock", () => {
    const { result } = renderInProvider({ colorScheme: "dark" }, useColorScheme);
    expect((result.value as Accessor<string>)()).toBe("dark");
  });

  it("updates when themeChanged is emitted", () => {
    const { result, mock } = renderInProvider({ colorScheme: "light" }, useColorScheme);
    mock.setState({ colorScheme: "dark" });
    mock.emit("themeChanged", undefined);
    expect((result.value as Accessor<string>)()).toBe("dark");
  });
});

describe("useViewportHeight", () => {
  it("returns initial viewport height", () => {
    const { result } = renderInProvider({ viewportHeight: 812 }, useViewportHeight);
    expect((result.value as Accessor<number>)()).toBe(812);
  });
});

describe("useIsVersionAtLeast", () => {
  it("returns true when current version satisfies the requirement", () => {
    const { result } = renderInProvider({ version: "8.0" }, () => useIsVersionAtLeast("7.0"));
    expect((result.value as Accessor<boolean>)()).toBe(true);
  });

  it("returns false when current version does not satisfy the requirement", () => {
    const { result } = renderInProvider({ version: "7.0" }, () => useIsVersionAtLeast("8.0"));
    expect((result.value as Accessor<boolean>)()).toBe(false);
  });
});
