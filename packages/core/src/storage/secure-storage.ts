import { TmaStorageError } from "../errors";
import type { TelegramSecureStorage } from "../types/telegram";

/**
 * The result of a `TmaSecureStorage.getItem()` call.
 *
 * `value` is `null` when the key does not exist in the secure enclave.
 * `canRestore` is `true` when a backed-up copy of the value is available
 * and can be recovered via `restoreItem()`.
 */
export interface SecureGetResult {
  /** The stored value, or `null` if the key does not exist. */
  value: string | null;
  /**
   * Whether the value can be recovered from a device backup via
   * `restoreItem()`. Useful after app reinstallation.
   */
  canRestore: boolean;
}

/**
 * Promise-based wrapper around `TelegramSecureStorage`.
 *
 * Wraps the callback-based `SecureStorage` API into async methods and
 * converts error strings into `TmaStorageError` rejections. Values are
 * stored in the device's secure enclave (iOS Keychain / Android Keystore)
 * and survive app reinstallation via backup restoration.
 *
 * Obtain an instance via `createSecureStorage(bridge.webApp.SecureStorage)`.
 *
 * @since Bot API 9.0
 * @see https://core.telegram.org/bots/webapps#securestorage
 *
 * @example
 * const storage = createSecureStorage(bridge.webApp.SecureStorage);
 * await storage.setItem("auth_token", "secret");
 * const { value, canRestore } = await storage.getItem("auth_token");
 */
export interface TmaSecureStorage {
  /**
   * Retrieve the value for `key` from the secure enclave.
   * Returns a `SecureGetResult` with `value: null` when the key does not
   * exist. Check `canRestore` to determine if the value can be recovered
   * from a backup via `restoreItem()`.
   */
  getItem(key: string): Promise<SecureGetResult>;

  /** Store `value` under `key` in the secure enclave. */
  setItem(key: string, value: string): Promise<void>;

  /**
   * Attempt to restore a backed-up value for `key`. Returns the restored
   * value, or `null` if no backup is available.
   */
  restoreItem(key: string): Promise<string | null>;

  /** Delete the entry for `key` from the secure enclave. */
  removeItem(key: string): Promise<void>;

  /** Clear all stored key-value pairs from the secure enclave. */
  clear(): Promise<void>;
}

/**
 * Create a `TmaSecureStorage` instance backed by the given
 * `TelegramSecureStorage` object.
 *
 * @param ss - `bridge.webApp.SecureStorage` from an initialised `TmaBridge`.
 *
 * @example
 * const storage = createSecureStorage(bridge.webApp.SecureStorage);
 * const { value, canRestore } = await storage.getItem("auth_token");
 * if (value === null && canRestore) {
 *   const restored = await storage.restoreItem("auth_token");
 * }
 */
export function createSecureStorage(ss: TelegramSecureStorage): TmaSecureStorage {
  return {
    getItem(key) {
      return new Promise((resolve, reject) => {
        ss.getItem(key, (error, value, canRestore) => {
          if (error) reject(new TmaStorageError(error));
          else resolve({ value: value ?? null, canRestore: canRestore ?? false });
        });
      });
    },

    setItem(key, value) {
      return new Promise((resolve, reject) => {
        ss.setItem(key, value, (error) => {
          if (error) reject(new TmaStorageError(error));
          else resolve();
        });
      });
    },

    restoreItem(key) {
      return new Promise((resolve, reject) => {
        ss.restoreItem(key, (error, value) => {
          if (error) reject(new TmaStorageError(error));
          else resolve(value ?? null);
        });
      });
    },

    removeItem(key) {
      return new Promise((resolve, reject) => {
        ss.removeItem(key, (error) => {
          if (error) reject(new TmaStorageError(error));
          else resolve();
        });
      });
    },

    clear() {
      return new Promise((resolve, reject) => {
        ss.clear((error) => {
          if (error) reject(new TmaStorageError(error));
          else resolve();
        });
      });
    },
  };
}