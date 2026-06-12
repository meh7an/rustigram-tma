import { TmaSensorError } from "../errors";
import type { TmaBridge } from "../bridge/tma-bridge";
import type { TelegramGyroscope, TelegramWebApp } from "../types/telegram";
import type { GyroscopeStartParams } from "../schemas/sensor-params";
import type { Vector3D } from "./accelerometer";

/**
 * Promise-based wrapper around `TelegramGyroscope`.
 *
 * Provides async `start`/`stop`, a push-based `subscribe` API for streaming
 * readings, and a pull-based `getData` accessor. The `Vector3D` values
 * represent angular velocity in rad/s along each axis. Throws
 * `TmaSensorError` if the device does not support the gyroscope.
 *
 * Obtain an instance via `createGyroscope(bridge)`. Call `destroy()` when
 * done to remove all event listeners and subscribers.
 *
 * @since Bot API 8.0
 * @see https://core.telegram.org/bots/webapps#gyroscope
 *
 * @example
 * const gyro = createGyroscope(bridge);
 * await gyro.start({ refresh_rate: 100 });
 * const unsubscribe = gyro.subscribe((v) => {
 *   console.log(`x=${v.x} y=${v.y} z=${v.z}`);
 * });
 */
export interface TmaGyroscope {
  /**
   * Start gyroscope tracking. Rejects with `TmaSensorError` if the device
   * does not support it.
   */
  start(params?: GyroscopeStartParams): Promise<void>;

  /** Stop gyroscope tracking. Rejects with `TmaSensorError` on failure. */
  stop(): Promise<void>;

  /**
   * Register a callback that receives a new `Vector3D` reading (rad/s) each
   * time `gyroscopeChanged` fires.
   *
   * @returns An unsubscribe function. Call it to remove the callback.
   */
  subscribe(callback: (data: Vector3D) => void): () => void;

  /**
   * Return the most recent reading in rad/s, or `null` if the sensor is
   * not started.
   */
  getData(): Vector3D | null;

  /** Whether gyroscope tracking is currently active. */
  isRunning(): boolean;

  /**
   * Remove the `gyroscopeChanged` event listener and clear all subscribers.
   * Call this when the sensor is no longer needed.
   */
  destroy(): void;
}

/**
 * Create a `TmaGyroscope` instance backed by the given bridge.
 *
 * @param bridge - A `TmaBridge` instance returned by `initBridge()`.
 * @param sensor - Defaults to `bridge.webApp.Gyroscope`. Override in tests.
 *
 * @example
 * const gyro = createGyroscope(bridge);
 * await gyro.start({ refresh_rate: 50 });
 */
export function createGyroscope(
  bridge: TmaBridge,
  sensor: TelegramGyroscope = bridge.webApp.Gyroscope,
): TmaGyroscope {
  const subscribers = new Set<(data: Vector3D) => void>();

  function onChanged(this: TelegramWebApp): void {
    const data: Vector3D = { x: sensor.x, y: sensor.y, z: sensor.z };
    for (const cb of subscribers) cb(data);
  }

  bridge.on("gyroscopeChanged", onChanged);

  return {
    start(params = {}) {
      return new Promise((resolve, reject) => {
        sensor.start(params, (started) => {
          if (started) resolve();
          else reject(new TmaSensorError("Gyroscope failed to start — device may not support it."));
        });
      });
    },

    stop() {
      return new Promise((resolve, reject) => {
        sensor.stop((stopped) => {
          if (stopped) resolve();
          else reject(new TmaSensorError("Gyroscope failed to stop."));
        });
      });
    },

    subscribe(callback) {
      subscribers.add(callback);
      return () => subscribers.delete(callback);
    },

    getData() {
      if (!sensor.isStarted) return null;
      return { x: sensor.x, y: sensor.y, z: sensor.z };
    },

    isRunning() {
      return sensor.isStarted;
    },

    destroy() {
      bridge.off("gyroscopeChanged", onChanged);
      subscribers.clear();
    },
  };
}