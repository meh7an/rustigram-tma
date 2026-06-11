import type { TmaEventType } from "../schemas/events";
import type { TmaEventHandler } from "../types/telegram";
import type { ColorScheme, ThemeParams } from "../schemas/theme";
import type { WebAppInitData } from "../schemas/init-data";
import type { TelegramWebApp } from "../types/telegram";

export class TmaBridgeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TmaBridgeError";
  }
}

/** Immutable snapshot of the WebApp state captured at bridge initialisation. */
export interface LaunchContext {
  readonly version: string;
  readonly platform: string;
  readonly colorScheme: ColorScheme;
  readonly themeParams: ThemeParams;
  readonly initDataUnsafe: WebAppInitData;
}

export interface BridgeOptions {
  /**
   * Bypass window.Telegram.WebApp with a compatible implementation.
   * Intended for testing — use createTmaMock() from @rustigram/tma-core/mock.
   */
  mockWebApp?: TelegramWebApp;
  /**
   * Skip calling WebApp.ready() automatically on init.
   * Use when you need to control exactly when the loading placeholder hides.
   */
  skipReady?: boolean;
}

export interface TmaBridge {
  readonly webApp: TelegramWebApp;
  readonly launchContext: LaunchContext;
  on<T extends TmaEventType>(event: T, handler: TmaEventHandler<T>): void;
  off<T extends TmaEventType>(event: T, handler: TmaEventHandler<T>): void;
  isVersionAtLeast(version: string): boolean;
}

function resolveWebApp(options?: BridgeOptions): TelegramWebApp {
  if (options?.mockWebApp !== undefined) {
    return options.mockWebApp;
  }

  if (typeof window !== "undefined" && window.Telegram?.WebApp !== undefined) {
    return window.Telegram.WebApp;
  }

  throw new TmaBridgeError(
    "Telegram WebApp is not available. Ensure telegram-web-app.js is loaded " +
    "via CDN before calling initBridge(), or pass mockWebApp in BridgeOptions for testing.",
  );
}

export function initBridge(options?: BridgeOptions): TmaBridge {
  const webApp = resolveWebApp(options);

  if (!options?.skipReady) {
    webApp.ready();
  }

  const launchContext: LaunchContext = {
    version: webApp.version,
    platform: webApp.platform,
    colorScheme: webApp.colorScheme,
    themeParams: webApp.themeParams,
    initDataUnsafe: webApp.initDataUnsafe,
  };

  return {
    webApp,
    launchContext,

    on<T extends TmaEventType>(event: T, handler: TmaEventHandler<T>): void {
      webApp.onEvent(event, handler);
    },

    off<T extends TmaEventType>(event: T, handler: TmaEventHandler<T>): void {
      webApp.offEvent(event, handler);
    },

    isVersionAtLeast(version: string): boolean {
      return webApp.isVersionAtLeast(version);
    },
  };
}

/** Returns true when window.Telegram.WebApp is present and accessible. */
export function isTelegramAvailable(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.Telegram !== "undefined" &&
    typeof window.Telegram.WebApp !== "undefined"
  );
}
