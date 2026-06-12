import { TmaSensorError } from "../errors";
import type { TmaBridge } from "../bridge/tma-bridge";
import type { TelegramAccelerometer, TelegramWebApp } from "../types/telegram";
import type { AccelerometerStartParams } from "../schemas/sensor-params";

/**
 * An immutable 3-axis vector. Used for accelerometer and gyroscope readings.
 *
 * Units depend on the sensor:
 * - Accelerometer: m/s²
 * - Gyroscope: rad/s
 */
export interface Vector3D {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

/**
 * Promise-based wrapper around `TelegramAccelerometer`.
 *
 * Provides async `start`/`stop`, a push-based `subscribe` API for streaming
 * readings, and a pull-based `getData` accessor. Throws `TmaSensorError` if
 * the device does not support the accelerometer.
 *
 * Obtain an instance via `createAccelerometer(bridge)`. Call `destroy()` when
 * done to remove all event listeners and subscribers.
 *
 * @since Bot API 8.0
 * @see https://core.telegram.org/bots/webapps#accelerometer
 *
 * @example
 * const accel = createAccelerometer(bridge);
 * await accel.start({ refresh_rate: 100 });
 * const unsubscribe = accel.subscribe((v) => {
 *   console.log(`x=${v.x} y=${v.y} z=${v.z}`);
 * });
 */
export interface TmaAccelerometer {
  /**
   * Start accelerometer tracking. Rejects with `TmaSensorError` if the
   * device does not support it.
   */
  start(params?: AccelerometerStartParams): Promise<void>;

  /** Stop accelerometer tracking. Rejects with `TmaSensorError` on failure. */
  stop(): Promise<void>;

  /**
   * Register a callback that receives a new `Vector3D` reading each time
   * `accelerometerChanged` fires.
   *
   * @returns An unsubscribe function. Call it to remove the callback.
   */
  subscribe(callback: (data: Vector3D) => void): () => void;

  /**
   * Return the most recent reading, or `null` if the sensor is not started.
   */
  getData(): Vector3D | null;

  /** Whether accelerometer tracking is currently active. */
  isRunning(): boolean;

  /**
   * Remove the `accelerometerChanged` event listener and clear all
   * subscribers. Call this when the sensor is no longer needed.
   */
  destroy(): void;
}

/**
 * Create a `TmaAccelerometer` instance backed by the given bridge.
 *
 * @param bridge - A `TmaBridge` instance returned by `initBridge()`.
 * @param sensor - Defaults to `bridge.webApp.Accelerometer`. Override in tests.
 *
 * @example
 * const accel = createAccelerometer(bridge);
 * await accel.start({ refresh_rate: 50 });
 */
export function createAccelerometer(
  bridge: TmaBridge,
  sensor: TelegramAccelerometer = bridge.webApp.Accelerometer,
): TmaAccelerometer {
  const subscribers = new Set<(data: Vector3D) => void>();

  function onChanged(this: TelegramWebApp): void {
    const data: Vector3D = { x: sensor.x, y: sensor.y, z: sensor.z };
    for (const cb of subscribers) cb(data);
  }

  bridge.on("accelerometerChanged", onChanged);

  return {
    start(params = {}) {
      return new Promise((resolve, reject) => {
        sensor.start(params, (started) => {
          if (started) resolve();
          else reject(new TmaSensorError("Accelerometer failed to start — device may not support it."));
        });
      });
    },

    stop() {
      return new Promise((resolve, reject) => {
        sensor.stop((stopped) => {
          if (stopped) resolve();
          else reject(new TmaSensorError("Accelerometer failed to stop."));
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
      bridge.off("accelerometerChanged", onChanged);
      subscribers.clear();
    },
  };
}