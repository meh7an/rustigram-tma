import { TmaStorageError } from "../errors";
import type { TelegramSecureStorage } from "../types/telegram";

export interface SecureGetResult {
  value: string | null;
  canRestore: boolean;
}

export interface TmaSecureStorage {
  getItem(key: string): Promise<SecureGetResult>;
  setItem(key: string, value: string): Promise<void>;
  restoreItem(key: string): Promise<string | null>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

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
