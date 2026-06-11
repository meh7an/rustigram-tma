import type { TmaBridge } from "../bridge/tma-bridge";
import type { TelegramLocationManager, TelegramWebApp } from "../types/telegram";
import type { LocationData } from "../schemas/location";

export interface LocationManagerStatus {
  readonly isInited: boolean;
  readonly isLocationAvailable: boolean;
  readonly isAccessRequested: boolean;
  readonly isAccessGranted: boolean;
}

export interface TmaLocationManager {
  init(): Promise<void>;
  getLocation(): Promise<LocationData | null>;
  openSettings(): void;
  getStatus(): LocationManagerStatus;
  destroy(): void;
}

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
