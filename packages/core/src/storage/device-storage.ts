import { TmaStorageError } from "../errors";
import type { TelegramDeviceStorage } from "../types/telegram";

/**
 * Promise-based wrapper around `TelegramDeviceStorage`.
 *
 * Wraps the callback-based `DeviceStorage` API into async methods and
 * converts error strings into `TmaStorageError` rejections. Data is
 * persisted locally on the device and is not synced across devices or
 * backed up to the cloud.
 *
 * Obtain an instance via `createDeviceStorage(bridge.webApp.DeviceStorage)`.
 *
 * @since Bot API 9.0
 * @see https://core.telegram.org/bots/webapps#devicestorage
 *
 * @example
 * const storage = createDeviceStorage(bridge.webApp.DeviceStorage);
 * await storage.setItem("session_id", "abc123");
 * const id = await storage.getItem("session_id"); // "abc123"
 */
export interface TmaDeviceStorage {
  /**
   * Retrieve the value for `key`. Returns `null` when the key does not
   * exist.
   */
  getItem(key: string): Promise<string | null>;

  /** Store `value` under `key`. */
  setItem(key: string, value: string): Promise<void>;

  /** Delete the entry for `key`. No-op if the key does not exist. */
  removeItem(key: string): Promise<void>;

  /** Clear all stored key-value pairs. */
  clear(): Promise<void>;
}

/**
 * Create a `TmaDeviceStorage` instance backed by the given
 * `TelegramDeviceStorage` object.
 *
 * @param ds - `bridge.webApp.DeviceStorage` from an initialised `TmaBridge`.
 *
 * @example
 * const storage = createDeviceStorage(bridge.webApp.DeviceStorage);
 * await storage.clear();
 */
export function createDeviceStorage(ds: TelegramDeviceStorage): TmaDeviceStorage {
  return {
    getItem(key) {
      return new Promise((resolve, reject) => {
        ds.getItem(key, (error, value) => {
          if (error) reject(new TmaStorageError(error));
          else resolve(value ?? null);
        });
      });
    },

    setItem(key, value) {
      return new Promise((resolve, reject) => {
        ds.setItem(key, value, (error) => {
          if (error) reject(new TmaStorageError(error));
          else resolve();
        });
      });
    },

    removeItem(key) {
      return new Promise((resolve, reject) => {
        ds.removeItem(key, (error) => {
          if (error) reject(new TmaStorageError(error));
          else resolve();
        });
      });
    },

    clear() {
      return new Promise((resolve, reject) => {
        ds.clear((error) => {
          if (error) reject(new TmaStorageError(error));
          else resolve();
        });
      });
    },
  };
}