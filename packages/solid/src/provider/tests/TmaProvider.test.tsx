import { afterEach, describe, expect, it } from "vitest";
import { render, cleanup } from "@solidjs/testing-library";
import { createTmaMock } from "@rustigram/tma-core/mock";
import { TmaProvider } from "../TmaProvider";
import { useTma } from "../use-tma";

afterEach(cleanup);

function makeMockOptions() {
  const mock = createTmaMock({ colorScheme: "dark" });
  return { mock, options: { mockWebApp: mock.webApp, skipReady: true as const } };
}

describe("TmaProvider", () => {
  it("renders children inside a valid context", () => {
    const { options } = makeMockOptions();
    const { getByText } = render(() => (
      <TmaProvider options={options}>
        <span>hello</span>
      </TmaProvider>
    ));
    expect(getByText("hello")).toBeTruthy();
  });

  it("renders the fallback when WebApp is unavailable (no mock, no window.Telegram)", () => {
    const { getByText } = render(() => (
      <TmaProvider fallback={<span>not in telegram</span>}>
        <span>app</span>
      </TmaProvider>
    ));
    expect(getByText("not in telegram")).toBeTruthy();
  });

  it("provides bridge and appState via useTma()", () => {
    const { mock, options } = makeMockOptions();
    let ctx: ReturnType<typeof useTma> | undefined;

    render(() => (
      <TmaProvider options={options}>
        {(() => { ctx = useTma(); return null; })()}
      </TmaProvider>
    ));

    expect(ctx?.bridge).toBeDefined();
    expect(ctx?.appState).toBeDefined();
  });

  it("throws when useTma() is called outside TmaProvider", () => {
    expect(() => {
      render(() => {
        useTma();
        return null;
      });
    }).toThrow("useTma() must be called inside a <TmaProvider>");
  });
});
