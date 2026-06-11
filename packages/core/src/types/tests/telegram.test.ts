import { describe, expectTypeOf, it } from "vitest";

import type {
  TelegramBackButton,
  TelegramBottomButton,
  TelegramWebApp,
  TmaEventHandler,
} from "../telegram";
import type { TmaEventPayload } from "../../schemas/events";

describe("BackButton chaining", () => {
  it("show() returns the button for chaining", () => {
    expectTypeOf<TelegramBackButton["show"]>().returns.toEqualTypeOf<TelegramBackButton>();
  });

  it("hide() returns the button for chaining", () => {
    expectTypeOf<TelegramBackButton["hide"]>().returns.toEqualTypeOf<TelegramBackButton>();
  });

  it("onClick() returns the button for chaining", () => {
    expectTypeOf<TelegramBackButton["onClick"]>().returns.toEqualTypeOf<TelegramBackButton>();
  });
});

describe("BottomButton chaining", () => {
  it("setParams() returns the button for chaining", () => {
    expectTypeOf<TelegramBottomButton["setParams"]>().returns.toEqualTypeOf<TelegramBottomButton>();
  });

  it("showProgress() returns the button for chaining", () => {
    expectTypeOf<TelegramBottomButton["showProgress"]>()
      .returns.toEqualTypeOf<TelegramBottomButton>();
  });
});

describe("TelegramWebApp.sendData", () => {
  it("accepts only a string", () => {
    expectTypeOf<TelegramWebApp["sendData"]>().parameter(0).toBeString();
  });
});

describe("TelegramWebApp.close", () => {
  it("options parameter is optional", () => {
    expectTypeOf<TelegramWebApp["close"]>().parameter(0).toBeNullable();
  });
});

describe("TmaEventHandler", () => {
  it("no-payload events produce a zero-argument handler", () => {
    type Handler = TmaEventHandler<"activated">;
    expectTypeOf<Handler>().parameters.toEqualTypeOf<[]>();
  });

  it("payload events produce a handler typed to the payload", () => {
    type Payload = TmaEventPayload<"viewportChanged">;
    type Handler = TmaEventHandler<"viewportChanged">;
    expectTypeOf<Handler>().parameters.toEqualTypeOf<[payload: Payload]>();
  });

  it("invoiceClosed handler payload has the correct status union", () => {
    type Payload = TmaEventPayload<"invoiceClosed">;
    expectTypeOf<Payload>().toHaveProperty("status");
  });
});

describe("Window global augmentation", () => {
  it("window.Telegram.WebApp is typed as TelegramWebApp", () => {
    expectTypeOf<typeof window.Telegram.WebApp>().toEqualTypeOf<TelegramWebApp>();
  });
});
