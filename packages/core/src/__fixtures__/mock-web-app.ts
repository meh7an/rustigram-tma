import { vi } from "vitest";

import type { TelegramWebApp, TmaEventHandler } from "../types/telegram";
import type { TmaEventType, TmaEventPayload } from "../schemas/events";
import type { ThemeParams } from "../schemas/theme";

interface MockWebAppOverrides {
  version?: string;
  platform?: string;
  colorScheme?: TelegramWebApp["colorScheme"];
  themeParams?: Partial<ThemeParams>;
  viewportHeight?: number;
  viewportStableHeight?: number;
}

// Minimal WebApp-compatible object for unit tests.
// The full mock (createTmaMock) is built in M2.5 and lives in @rustigram/tma-core/mock.
export type MockWebApp = TelegramWebApp & {
  /** Trigger a registered event handler as if Telegram fired it. */
  __emit<T extends TmaEventType>(event: T, payload: TmaEventPayload<T>): void;
  colorScheme: TelegramWebApp["colorScheme"];
  viewportHeight: number;
  viewportStableHeight: number;
  themeParams: TelegramWebApp["themeParams"];
};

export function buildMockWebApp(overrides: MockWebAppOverrides = {}): MockWebApp {
  const handlers = new Map<TmaEventType, Set<TmaEventHandler<TmaEventType>>>();

  const webApp = {
    // ── Mutable fields ───────────────────────────────────────────────────────
    colorScheme: overrides.colorScheme ?? "light",
    themeParams: { bg_color: "#ffffff", ...overrides.themeParams },
    viewportHeight: overrides.viewportHeight ?? 667,
    viewportStableHeight: overrides.viewportStableHeight ?? 667,
    version: overrides.version ?? "8.0",
    platform: overrides.platform ?? "unknown",
    isActive: true,
    isExpanded: false,
    isFullscreen: false,
    isOrientationLocked: false,
    isClosingConfirmationEnabled: false,
    isVerticalSwipesEnabled: true,
    headerColor: "#ffffff",
    backgroundColor: "#ffffff",
    bottomBarColor: "#ffffff",
    safeAreaInset: { top: 0, bottom: 0, left: 0, right: 0 },
    contentSafeAreaInset: { top: 0, bottom: 0, left: 0, right: 0 },
    initData: "",
    initDataUnsafe: { auth_date: 0, hash: "" },

    // ── Lifecycle stubs ──────────────────────────────────────────────────────
    ready: vi.fn(),
    expand: vi.fn(),
    close: vi.fn(),
    isVersionAtLeast: vi.fn((v: string) => {
      const parse = (s: string): [number, number] => {
        const parts = s.split(".");
        return [Number(parts[0] ?? "0"), Number(parts[1] ?? "0")];
      };
      const [maj, min] = parse(v);
      const [curMaj, curMin] = parse(overrides.version ?? "8.0");
      return curMaj > maj || (curMaj === maj && curMin >= min);
    }),

    // ── Event system ─────────────────────────────────────────────────────────
    onEvent: vi.fn(<T extends TmaEventType>(event: T, handler: TmaEventHandler<T>) => {
      if (!handlers.has(event)) handlers.set(event, new Set());
      handlers.get(event)!.add(handler as TmaEventHandler<TmaEventType>);
    }),
    offEvent: vi.fn(<T extends TmaEventType>(event: T, handler: TmaEventHandler<T>) => {
      handlers.get(event)?.delete(handler as TmaEventHandler<TmaEventType>);
    }),

    // ── Test helper ──────────────────────────────────────────────────────────
    __emit<T extends TmaEventType>(event: T, payload: TmaEventPayload<T>): void {
      for (const handler of handlers.get(event) ?? []) {
        if (payload === undefined) {
          (handler as (this: TelegramWebApp) => void).call(webApp as TelegramWebApp);
        } else {
          (handler as (this: TelegramWebApp, p: TmaEventPayload<T>) => void).call(
            webApp as TelegramWebApp,
            payload,
          );
        }
      }
    },
  } as unknown as MockWebApp;

  return webApp;
}
