import { TmaSensorError } from "../errors";
import type { TmaBridge } from "../bridge/tma-bridge";
import type { TelegramDeviceOrientation, TelegramWebApp } from "../types/telegram";
import type { DeviceOrientationStartParams } from "../schemas/sensor-params";

/**
 * A snapshot of device orientation angles.
 *
 * - `alpha` — rotation around the Z axis (compass heading), in degrees [0, 360).
 * - `beta`  — rotation around the X axis (front-to-back tilt), in degrees [-180, 180].
 * - `gamma` — rotation around the Y axis (left-to-right tilt), in degrees [-90, 90].
 * - `absolute` — whether the data is relative to magnetic north (`true`) or
 *   to an arbitrary reference frame (`false`). May differ from `need_absolute`
 *   if the device cannot provide absolute data.
 */
export interface OrientationData {
  readonly absolute: boolean;
  readonly alpha: number;
  readonly beta: number;
  readonly gamma: number;
}

/**
 * Promise-based wrapper around `TelegramDeviceOrientation`.
 *
 * Provides async `start`/`stop`, a push-based `subscribe` API for streaming
 * orientation readings, and a pull-based `getData` accessor. Throws
 * `TmaSensorError` if the device does not support orientation tracking.
 *
 * Pass `need_absolute: true` in `start()` params to request data relative to
 * magnetic north (useful for compass features). Check `OrientationData.absolute`
 * on each reading to verify whether absolute data was actually provided —
 * some devices ignore the request and always return relative data.
 *
 * Obtain an instance via `createDeviceOrientation(bridge)`. Call `destroy()`
 * when done to remove all event listeners and subscribers.
 *
 * @since Bot API 8.0
 * @see https://core.telegram.org/bots/webapps#deviceorientation
 *
 * @example
 * const orientation = createDeviceOrientation(bridge);
 * await orientation.start({ need_absolute: true });
 * const unsubscribe = orientation.subscribe((data) => {
 *   if (data.absolute) console.log(`Heading: ${data.alpha}°`);
 * });
 */
export interface TmaDeviceOrientation {
  /**
   * Start device orientation tracking. Rejects with `TmaSensorError` if
   * the device does not support it.
   */
  start(params?: DeviceOrientationStartParams): Promise<void>;

  /** Stop device orientation tracking. Rejects with `TmaSensorError` on failure. */
  stop(): Promise<void>;

  /**
   * Register a callback that receives a new `OrientationData` snapshot each
   * time `deviceOrientationChanged` fires.
   *
   * @returns An unsubscribe function. Call it to remove the callback.
   */
  subscribe(callback: (data: OrientationData) => void): () => void;

  /**
   * Return the most recent orientation snapshot, or `null` if the sensor is
   * not started.
   */
  getData(): OrientationData | null;

  /** Whether device orientation tracking is currently active. */
  isRunning(): boolean;

  /**
   * Remove the `deviceOrientationChanged` event listener and clear all
   * subscribers. Call this when the sensor is no longer needed.
   */
  destroy(): void;
}

/**
 * Create a `TmaDeviceOrientation` instance backed by the given bridge.
 *
 * @param bridge - A `TmaBridge` instance returned by `initBridge()`.
 * @param sensor - Defaults to `bridge.webApp.DeviceOrientation`. Override in tests.
 *
 * @example
 * const orientation = createDeviceOrientation(bridge);
 * await orientation.start({ need_absolute: true, refresh_rate: 100 });
 */
export function createDeviceOrientation(
  bridge: TmaBridge,
  sensor: TelegramDeviceOrientation = bridge.webApp.DeviceOrientation,
): TmaDeviceOrientation {
  const subscribers = new Set<(data: OrientationData) => void>();

  function onChanged(this: TelegramWebApp): void {
    const data: OrientationData = {
      absolute: sensor.absolute,
      alpha: sensor.alpha,
      beta: sensor.beta,
      gamma: sensor.gamma,
    };
    for (const cb of subscribers) cb(data);
  }

  bridge.on("deviceOrientationChanged", onChanged);

  return {
    start(params = {}) {
      return new Promise((resolve, reject) => {
        sensor.start(params, (started) => {
          if (started) resolve();
          else reject(new TmaSensorError("DeviceOrientation failed to start."));
        });
      });
    },

    stop() {
      return new Promise((resolve, reject) => {
        sensor.stop((stopped) => {
          if (stopped) resolve();
          else reject(new TmaSensorError("DeviceOrientation failed to stop."));
        });
      });
    },

    subscribe(callback) {
      subscribers.add(callback);
      return () => subscribers.delete(callback);
    },

    getData() {
      if (!sensor.isStarted) return null;
      return { absolute: sensor.absolute, alpha: sensor.alpha, beta: sensor.beta, gamma: sensor.gamma };
    },

    isRunning() {
      return sensor.isStarted;
    },

    destroy() {
      bridge.off("deviceOrientationChanged", onChanged);
      subscribers.clear();
    },
  };
}