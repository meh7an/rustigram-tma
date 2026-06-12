import type { TmaBridge } from "../bridge/tma-bridge";
import type { TelegramLocationManager, TelegramWebApp } from "../types/telegram";
import type { LocationData } from "../schemas/location";

/**
 * A point-in-time snapshot of `LocationManager` state fields. Retrieve via
 * `TmaLocationManager.getStatus()`.
 */
export interface LocationManagerStatus {
  /** Whether `init()` has completed. */
  readonly isInited: boolean;
  /** Whether the device supports location services. */
  readonly isLocationAvailable: boolean;
  /** Whether the bot has previously requested location access. */
  readonly isAccessRequested: boolean;
  /** Whether the user has granted location access to the bot. */
  readonly isAccessGranted: boolean;
}

/**
 * Promise-based wrapper around `TelegramLocationManager`.
 *
 * Wraps the callback-based `LocationManager` API into async methods. Must be
 * initialised by calling `init()` before any other method.
 *
 * Obtain an instance via `createLocationManager(bridge)`. Call `destroy()`
 * when done to remove the `locationManagerUpdated` event listener.
 *
 * @since Bot API 8.0
 * @see https://core.telegram.org/bots/webapps#locationmanager
 *
 * @example
 * const location = createLocationManager(bridge);
 * await location.init();
 * const data = await location.getLocation();
 * if (data) {
 *   console.log(`${data.latitude}, ${data.longitude}`);
 * }
 */
export interface TmaLocationManager {
  /**
   * Initialise the `LocationManager`. Must be called before any other
   * method.
   */
  init(): Promise<void>;

  /**
   * Request the current location. Returns `null` if access is denied or
   * location services are unavailable on the device.
   */
  getLocation(): Promise<LocationData | null>;

  /**
   * Open the Telegram settings page for this bot's location permissions.
   * Must be called in response to a direct user interaction.
   */
  openSettings(): void;

  /** Return the current `LocationManagerStatus` snapshot. */
  getStatus(): LocationManagerStatus;

  /**
   * Remove the `locationManagerUpdated` event listener. Call this when
   * the manager is no longer needed.
   */
  destroy(): void;
}

/**
 * Create a `TmaLocationManager` instance backed by the given bridge.
 *
 * @param bridge - A `TmaBridge` instance returned by `initBridge()`.
 * @param manager - Defaults to `bridge.webApp.LocationManager`. Override in tests.
 *
 * @example
 * const location = createLocationManager(bridge);
 * await location.init();
 * const data = await location.getLocation(); // LocationData | null
 */
export function createLocationManager(
  bridge: TmaBridge,
  manager: TelegramLocationManager = bridge.webApp.LocationManager,
): TmaLocationManager {
  const subscribers = new Set<() => void>();

  function onUpdated(this: TelegramWebApp): void {
    for (const cb of subscribers) cb();
  }

  bridge.on("locationManagerUpdated", onUpdated);

  return {
    init() {
      return new Promise((resolve) => {
        manager.init(() => resolve());
      });
    },

    getLocation() {
      return new Promise((resolve) => {
        manager.getLocation((data) => resolve(data));
      });
    },

    openSettings() {
      manager.openSettings();
    },

    getStatus() {
      return {
        isInited: manager.isInited,
        isLocationAvailable: manager.isLocationAvailable,
        isAccessRequested: manager.isAccessRequested,
        isAccessGranted: manager.isAccessGranted,
      };
    },

    destroy() {
      bridge.off("locationManagerUpdated", onUpdated);
      subscribers.clear();
    },
  };
}