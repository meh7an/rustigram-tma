import type { TmaEventType } from "../schemas/events";
import type { TmaEventHandler } from "../types/telegram";
import type { ColorScheme, ThemeParams } from "../schemas/theme";
import type { WebAppInitData } from "../schemas/init-data";
import type { TelegramWebApp } from "../types/telegram";

/**
 * Thrown when `initBridge()` cannot resolve a `TelegramWebApp` instance —
 * typically because `telegram-web-app.js` has not been loaded or the app
 * is running outside of Telegram.
 */
export class TmaBridgeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TmaBridgeError";
  }
}

/**
 * Immutable snapshot of the WebApp state captured at bridge initialisation.
 *
 * Values here reflect the state at the moment `initBridge()` was called and
 * do not update reactively. Use the event system for live updates.
 */
export interface LaunchContext {
  /** Bot API version string, e.g. `"8.0"`. */
  readonly version: string;
  /** Platform identifier, e.g. `"ios"`, `"android"`, `"tdesktop"`. */
  readonly platform: string;
  /** Color scheme active at launch. */
  readonly colorScheme: ColorScheme;
  /** Theme parameters active at launch. */
  readonly themeParams: ThemeParams;
  /**
   * Parsed `initData` object as provided by Telegram. Convenient for
   * reading on the client, but must not be trusted without server-side
   * validation of the raw `WebApp.initData` string.
   */
  readonly initDataUnsafe: WebAppInitData;
}

/**
 * Options for `initBridge()`.
 */
export interface BridgeOptions {
  /**
   * Substitute `window.Telegram.WebApp` with a compatible implementation.
   * Intended for testing — use `createTmaMock()` from
   * `@rustigram/tma-core/mock`.
   */
  mockWebApp?: TelegramWebApp;
  /**
   * Skip calling `WebApp.ready()` automatically on init. Use when you need
   * precise control over when the Telegram loading placeholder is hidden.
   */
  skipReady?: boolean;
}

/**
 * The primary interface for interacting with the Telegram Mini App runtime.
 * Obtain an instance by calling `initBridge()`.
 *
 * @example
 * const bridge = initBridge();
 * bridge.on("themeChanged", function () {
 *   applyTheme(this.themeParams);
 * });
 */
export interface TmaBridge {
  /** The underlying `TelegramWebApp` instance. Use for direct API calls not covered by the bridge. */
  readonly webApp: TelegramWebApp;
  /** Immutable snapshot of the WebApp state at the time `initBridge()` was called. */
  readonly launchContext: LaunchContext;
  /** Register a strongly-typed event handler. */
  on<T extends TmaEventType>(event: T, handler: TmaEventHandler<T>): void;
  /** Remove a previously registered event handler. */
  off<T extends TmaEventType>(event: T, handler: TmaEventHandler<T>): void;
  /** Returns `true` if the current Bot API version is at least `version`. */
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

/**
 * Initialise the TMA bridge and return a `TmaBridge` instance.
 *
 * Resolves `window.Telegram.WebApp` (or `options.mockWebApp` for testing),
 * calls `WebApp.ready()` unless `skipReady` is set, and captures an
 * immutable `LaunchContext` snapshot.
 *
 * Throws `TmaBridgeError` if `telegram-web-app.js` has not been loaded and
 * no `mockWebApp` is provided.
 *
 * @example
 * // Production
 * const bridge = initBridge();
 * console.log(bridge.launchContext.platform); // "ios"
 *
 * @example
 * // Testing
 * import { createTmaMock } from "@rustigram/tma-core/mock";
 * const bridge = initBridge({ mockWebApp: createTmaMock() });
 */
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

/**
 * Returns `true` when `window.Telegram.WebApp` is present and accessible.
 *
 * Use this to guard code that must only run inside Telegram, or to render
 * a fallback UI when the app is opened in a regular browser.
 *
 * @example
 * if (!isTelegramAvailable()) {
 *   renderFallback();
 * } else {
 *   const bridge = initBridge();
 * }
 */
export function isTelegramAvailable(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.Telegram !== "undefined" &&
    typeof window.Telegram.WebApp !== "undefined"
  );
}