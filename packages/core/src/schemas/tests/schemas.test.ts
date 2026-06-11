import { describe, expect, it } from "vitest";

import {
  ThemeParamsSchema,
  WebAppInitDataSchema,
  WebAppUserSchema,
  PopupParamsSchema,
  SafeAreaInsetSchema,
  LocationDataSchema,
  TmaEventPayloadSchemas,
  type TmaEventPayload,
} from "../index";

describe("ThemeParamsSchema", () => {
  it("accepts a fully populated theme", () => {
    const result = ThemeParamsSchema.safeParse({
      bg_color: "#1c1c1d",
      text_color: "#ffffff",
      button_color: "#2481cc",
      button_text_color: "#ffffff",
    });
    expect(result.success).toBe(true);
  });

  it("accepts an empty object — all fields are optional", () => {
    expect(ThemeParamsSchema.safeParse({}).success).toBe(true);
  });

  it("rejects a color without the leading #", () => {
    expect(ThemeParamsSchema.safeParse({ bg_color: "1c1c1d" }).success).toBe(false);
  });

  it("rejects a 3-digit shorthand color", () => {
    expect(ThemeParamsSchema.safeParse({ bg_color: "#fff" }).success).toBe(false);
  });
});

describe("WebAppUserSchema", () => {
  it("accepts a minimal user with only required fields", () => {
    const result = WebAppUserSchema.safeParse({ id: 123456789, first_name: "Mehran" });
    expect(result.success).toBe(true);
  });

  it("accepts is_premium as literal true", () => {
    const result = WebAppUserSchema.safeParse({
      id: 1,
      first_name: "A",
      is_premium: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects is_premium as false — Telegram never sends false, only omits", () => {
    expect(
      WebAppUserSchema.safeParse({ id: 1, first_name: "A", is_premium: false }).success,
    ).toBe(false);
  });
});

describe("WebAppInitDataSchema", () => {
  const validInitData = {
    auth_date: 1718000000,
    hash: "abc123",
    user: { id: 99999, first_name: "Mehran" },
  };

  it("round-trips a valid initData object", () => {
    const result = WebAppInitDataSchema.safeParse(validInitData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.auth_date).toBe(1718000000);
      expect(result.data.user?.first_name).toBe("Mehran");
    }
  });

  it("rejects when auth_date is missing", () => {
    const { auth_date: _, ...rest } = validInitData;
    expect(WebAppInitDataSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects when hash is missing", () => {
    const { hash: _, ...rest } = validInitData;
    expect(WebAppInitDataSchema.safeParse(rest).success).toBe(false);
  });
});

describe("PopupParamsSchema", () => {
  it("rejects an empty message", () => {
    expect(PopupParamsSchema.safeParse({ message: "" }).success).toBe(false);
  });

  it("rejects more than 3 buttons", () => {
    const buttons = Array.from({ length: 4 }, (_, i) => ({ id: String(i), type: "ok" as const }));
    expect(PopupParamsSchema.safeParse({ message: "hi", buttons }).success).toBe(false);
  });
});

describe("SafeAreaInsetSchema", () => {
  it("accepts zero insets", () => {
    expect(
      SafeAreaInsetSchema.safeParse({ top: 0, bottom: 0, left: 0, right: 0 }).success,
    ).toBe(true);
  });

  it("rejects negative insets", () => {
    expect(
      SafeAreaInsetSchema.safeParse({ top: -1, bottom: 0, left: 0, right: 0 }).success,
    ).toBe(false);
  });
});

describe("LocationDataSchema", () => {
  it("accepts null for optional sensor fields", () => {
    const result = LocationDataSchema.safeParse({
      latitude: 37.7749,
      longitude: -122.4194,
      altitude: null,
      course: null,
      speed: null,
      horizontal_accuracy: null,
      vertical_accuracy: null,
      course_accuracy: null,
      speed_accuracy: null,
    });
    expect(result.success).toBe(true);
  });
});

describe("TmaEventPayloadSchemas", () => {
  it("viewportChanged payload validates isStateStable", () => {
    const schema = TmaEventPayloadSchemas.viewportChanged;
    expect(schema.safeParse({ isStateStable: true }).success).toBe(true);
    expect(schema.safeParse({ isStateStable: "yes" }).success).toBe(false);
  });

  it("invoiceClosed only accepts known status values", () => {
    const schema = TmaEventPayloadSchemas.invoiceClosed;
    expect(schema.safeParse({ url: "https://t.me/invoice", status: "paid" }).success).toBe(true);
    expect(schema.safeParse({ url: "https://t.me/invoice", status: "unknown" }).success).toBe(
      false,
    );
  });

  it("activated payload is undefined", () => {
    expect(TmaEventPayloadSchemas.activated.safeParse(undefined).success).toBe(true);
  });

  // Type-level test: TmaEventPayload resolves correctly.
  it("TmaEventPayload type is inferred per event", () => {
    type ViewportPayload = TmaEventPayload<"viewportChanged">;
    const payload: ViewportPayload = { isStateStable: false };
    expect(payload.isStateStable).toBe(false);
  });
});
