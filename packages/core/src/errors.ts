/**
 * Base error class for all rustigram-tma errors.
 *
 * Extend this class to define domain-specific errors that
 * can be caught uniformly with `instanceof TmaError`.
 *
 * @example
 * try {
 *   await bridge.call("requestLocation");
 * } catch (err) {
 *   if (err instanceof TmaError) {
 *     console.error("TMA error:", err.message);
 *   }
 * }
 */
export class TmaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TmaError";
  }
}

/**
 * Thrown when a CloudStorage, DeviceStorage, or SecureStorage
 * operation fails — e.g. quota exceeded, key not found, or the
 * underlying Telegram API returns an error.
 *
 * @example
 * try {
 *   await cloudStorage.set("key", "value");
 * } catch (err) {
 *   if (err instanceof TmaStorageError) {
 *     console.error("Storage failed:", err.message);
 *   }
 * }
 */
export class TmaStorageError extends TmaError {
  constructor(message: string) {
    super(message);
    this.name = "TmaStorageError";
  }
}

/**
 * Thrown when a sensor operation fails — e.g. starting the
 * accelerometer on an unsupported platform, or when the
 * Telegram API version does not support the requested sensor.
 *
 * @example
 * try {
 *   await accelerometer.start({ refresh_rate: 100 });
 * } catch (err) {
 *   if (err instanceof TmaSensorError) {
 *     console.error("Sensor unavailable:", err.message);
 *   }
 * }
 */
export class TmaSensorError extends TmaError {
  constructor(message: string) {
    super(message);
    this.name = "TmaSensorError";
  }
}