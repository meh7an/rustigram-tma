import { TmaStorageError } from "../errors";
import type { TelegramCloudStorage } from "../types/telegram";

/**
 * Promise-based wrapper around `TelegramCloudStorage`.
 *
 * Wraps the callback-based `CloudStorage` API into async methods and
 * converts error strings into `TmaStorageError` rejections. Keys are
 * scoped per bot and limited to 1024 entries of up to 128 bytes each,
 * with values up to 4096 bytes.
 *
 * Obtain an instance via `createCloudStorage(bridge.webApp.CloudStorage)`.
 *
 * @since Bot API 6.9
 * @see https://core.telegram.org/bots/webapps#cloudstorage
 *
 * @example
 * const storage = createCloudStorage(bridge.webApp.CloudStorage);
 * await storage.setItem("user_pref", "dark");
 * const pref = await storage.getItem("user_pref"); // "dark"
 */
export interface TmaCloudStorage {
  /**
   * Retrieve the value for `key`. Returns `null` when the key does not
   * exist.
   */
  getItem(key: string): Promise<string | null>;

  /** Store `value` under `key`. */
  setItem(key: string, value: string): Promise<void>;

  /** Delete the entry for `key`. No-op if the key does not exist. */
  removeItem(key: string): Promise<void>;

  /** Delete entries for all provided keys in a single call. */
  removeItems(keys: string[]): Promise<void>;

  /**
   * Retrieve values for multiple keys in a single call. Missing keys are
   * returned as `null` in the result map.
   */
  getItems(keys: string[]): Promise<Record<string, string | null>>;

  /** Retrieve all stored keys. Returns an empty array when storage is empty. */
  getKeys(): Promise<string[]>;
}

/**
 * Create a `TmaCloudStorage` instance backed by the given
 * `TelegramCloudStorage` object.
 *
 * @param cs - `bridge.webApp.CloudStorage` from an initialised `TmaBridge`.
 *
 * @example
 * const storage = createCloudStorage(bridge.webApp.CloudStorage);
 * const keys = await storage.getKeys();
 */
export function createCloudStorage(cs: TelegramCloudStorage): TmaCloudStorage {
  return {
    getItem(key) {
      return new Promise((resolve, reject) => {
        cs.getItem(key, (error, value) => {
          if (error) reject(new TmaStorageError(error));
          else resolve(value ?? null);
        });
      });
    },

    setItem(key, value) {
      return new Promise((resolve, reject) => {
        cs.setItem(key, value, (error) => {
          if (error) reject(new TmaStorageError(error));
          else resolve();
        });
      });
    },

    removeItem(key) {
      return new Promise((resolve, reject) => {
        cs.removeItem(key, (error) => {
          if (error) reject(new TmaStorageError(error));
          else resolve();
        });
      });
    },

    removeItems(keys) {
      return new Promise((resolve, reject) => {
        cs.removeItems(keys, (error) => {
          if (error) reject(new TmaStorageError(error));
          else resolve();
        });
      });
    },

    getItems(keys) {
      return new Promise((resolve, reject) => {
        cs.getItems(keys, (error, values) => {
          if (error) {
            reject(new TmaStorageError(error));
            return;
          }
          // Keys absent from the result map are treated as null.
          const result: Record<string, string | null> = {};
          for (const key of keys) {
            result[key] = values?.[key] ?? null;
          }
          resolve(result);
        });
      });
    },

    getKeys() {
      return new Promise((resolve, reject) => {
        cs.getKeys((error, keys) => {
          if (error) reject(new TmaStorageError(error));
          else resolve(keys ?? []);
        });
      });
    },
  };
}