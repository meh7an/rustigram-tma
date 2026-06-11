import { TmaStorageError } from "../errors";
import type { TelegramDeviceStorage } from "../types/telegram";

export interface TmaDeviceStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

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
