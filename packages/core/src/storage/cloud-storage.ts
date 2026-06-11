import { TmaStorageError } from "../errors";
import type { TelegramCloudStorage } from "../types/telegram";

export interface TmaCloudStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  removeItems(keys: string[]): Promise<void>;
  getItems(keys: string[]): Promise<Record<string, string | null>>;
  getKeys(): Promise<string[]>;
}

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
