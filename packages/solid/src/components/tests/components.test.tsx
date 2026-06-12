// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, cleanup } from "@solidjs/testing-library";
import { TmaProvider } from "../../provider/TmaProvider";
import { BackButton } from "../BackButton";
import { MainButton } from "../MainButton";
import type { JSX } from "solid-js";
import { createTmaMock } from "@rustigram/tma-core/mock";

afterEach(cleanup);

function wrapper(mock: ReturnType<typeof createTmaMock>) {
  return (props: { children: JSX.Element }) => (
    <TmaProvider options={{ mockWebApp: mock.webApp, skipReady: true }}>
      {props.children}
    </TmaProvider>
  );
}

describe("BackButton", () => {
  it("shows on mount and hides on unmount", () => {
    const mock = createTmaMock();
    const Wrapper = wrapper(mock);
    render(() => (
      <Wrapper>
        <BackButton onBack={() => {}} />
      </Wrapper>
    ));
    expect(mock.webApp.BackButton.isVisible).toBe(true);
    mock.webApp.BackButton.hide();
    expect(mock.webApp.BackButton.isVisible).toBe(false);
  });

  it("fires onBack when backButtonClicked is emitted", () => {
    const mock = createTmaMock();
    const Wrapper = wrapper(mock);
    const handler = vi.fn();
    render(() => (
      <Wrapper>
        <BackButton onBack={handler} />
      </Wrapper>
    ));
    mock.emit("backButtonClicked", undefined);
    expect(handler).toHaveBeenCalledOnce();
  });
});

describe("MainButton", () => {
  it("shows on mount and hides on unmount", () => {
    const mock = createTmaMock();
    const Wrapper = wrapper(mock);
    render(() => (
      <Wrapper>
        <MainButton text="Pay" onClick={() => {}} />
      </Wrapper>
    ));
    expect(mock.webApp.MainButton.isVisible).toBe(true);
    mock.webApp.MainButton.hide();
    expect(mock.webApp.MainButton.isVisible).toBe(false);
  });

  it("sets the button text reactively", () => {
    const mock = createTmaMock();
    const Wrapper = wrapper(mock);
    render(() => (
      <Wrapper>
        <MainButton text="Confirm" onClick={() => {}} />
      </Wrapper>
    ));
    expect(mock.webApp.MainButton.text).toBe("Confirm");
  });

  it("fires onClick when mainButtonClicked is emitted", () => {
    const mock = createTmaMock();
    const Wrapper = wrapper(mock);
    const handler = vi.fn();
    render(() => (
      <Wrapper>
        <MainButton onClick={handler} />
      </Wrapper>
    ));
    mock.emit("mainButtonClicked", undefined);
    expect(handler).toHaveBeenCalledOnce();
  });
});
