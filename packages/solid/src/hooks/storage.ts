import { createSignal } from "solid-js";
import type { Accessor } from "solid-js";
import {
    createCloudStorage,
    createDeviceStorage,
    createSecureStorage,
} from "@rustigram/tma-core";
import { useTma } from "../provider/use-tma";

// ─── Cloud Storage ────────────────────────────────────────────────────────────

/**
 * Solid hook for `@rustigram/tma-core` `CloudStorage`.
 *
 * Wraps all storage operations with a shared `loading` signal that is `true`
 * while any async operation is in flight. Must be called inside a component
 * tree wrapped by `<TmaProvider>`.
 *
 * @since Bot API 6.9
 *
 * @example
 * const { getItem, setItem, loading } = useCloudStorage();
 * await setItem("key", "value");
 * const value = await getItem("key");
 */
export interface CloudStorageHook {
    /** Retrieve the value for `key`. Returns `null` when the key does not exist. */
    getItem(key: string): Promise<string | null>;
    /** Store `value` under `key`. */
    setItem(key: string, value: string): Promise<void>;
    /** Delete the entry for `key`. */
    removeItem(key: string): Promise<void>;
    /** Delete entries for all provided keys in a single call. */
    removeItems(keys: string[]): Promise<void>;
    /** Retrieve values for multiple keys. Missing keys are returned as `null`. */
    getItems(keys: string[]): Promise<Record<string, string | null>>;
    /** Retrieve all stored keys. */
    getKeys(): Promise<string[]>;
    /** `true` while any storage operation is in flight. */
    loading: Accessor<boolean>;
}

/**
 * Solid hook that provides Promise-based access to Telegram's cloud storage
 * with a reactive `loading` indicator.
 *
 * Must be called inside a component tree wrapped by `<TmaProvider>`.
 *
 * @since Bot API 6.9
 *
 * @example
 * const { getItem, setItem, loading } = useCloudStorage();
 */
export function useCloudStorage(): CloudStorageHook {
    const { bridge } = useTma();
    const storage = createCloudStorage(bridge.webApp.CloudStorage);
    const [loading, setLoading] = createSignal(false);

    async function run<T>(fn: () => Promise<T>): Promise<T> {
        setLoading(true);
        try {
            return await fn();
        } finally {
            setLoading(false);
        }
    }

    return {
        getItem: (key) => run(() => storage.getItem(key)),
        setItem: (key, value) => run(() => storage.setItem(key, value)),
        removeItem: (key) => run(() => storage.removeItem(key)),
        removeItems: (keys) => run(() => storage.removeItems(keys)),
        getItems: (keys) => run(() => storage.getItems(keys)),
        getKeys: () => run(() => storage.getKeys()),
        loading,
    };
}

// ─── Device Storage ───────────────────────────────────────────────────────────

/**
 * Solid hook for `@rustigram/tma-core` `DeviceStorage`.
 *
 * Wraps all storage operations with a shared `loading` signal. Data is
 * persisted locally on the device and is not synced across devices.
 *
 * Must be called inside a component tree wrapped by `<TmaProvider>`.
 *
 * @since Bot API 9.0
 *
 * @example
 * const { getItem, setItem, loading } = useDeviceStorage();
 */
export interface DeviceStorageHook {
    /** Retrieve the value for `key`. Returns `null` when the key does not exist. */
    getItem(key: string): Promise<string | null>;
    /** Store `value` under `key`. */
    setItem(key: string, value: string): Promise<void>;
    /** Delete the entry for `key`. */
    removeItem(key: string): Promise<void>;
    /** Clear all stored key-value pairs. */
    clear(): Promise<void>;
    /** `true` while any storage operation is in flight. */
    loading: Accessor<boolean>;
}

/**
 * Solid hook that provides Promise-based access to the device's local storage
 * with a reactive `loading` indicator.
 *
 * Must be called inside a component tree wrapped by `<TmaProvider>`.
 *
 * @since Bot API 9.0
 *
 * @example
 * const { getItem, setItem, loading } = useDeviceStorage();
 */
export function useDeviceStorage(): DeviceStorageHook {
    const { bridge } = useTma();
    const storage = createDeviceStorage(bridge.webApp.DeviceStorage);
    const [loading, setLoading] = createSignal(false);

    async function run<T>(fn: () => Promise<T>): Promise<T> {
        setLoading(true);
        try {
            return await fn();
        } finally {
            setLoading(false);
        }
    }

    return {
        getItem: (key) => run(() => storage.getItem(key)),
        setItem: (key, value) => run(() => storage.setItem(key, value)),
        removeItem: (key) => run(() => storage.removeItem(key)),
        clear: () => run(() => storage.clear()),
        loading,
    };
}

// ─── Secure Storage ───────────────────────────────────────────────────────────

/**
 * Solid hook for `@rustigram/tma-core` `SecureStorage`.
 *
 * Wraps all storage operations with a shared `loading` signal. Values are
 * stored in the device's secure enclave (iOS Keychain / Android Keystore)
 * and survive app reinstallation via backup restoration.
 *
 * Must be called inside a component tree wrapped by `<TmaProvider>`.
 *
 * @since Bot API 9.0
 *
 * @example
 * const { getItem, loading } = useSecureStorage();
 * const { value, canRestore } = await getItem("auth_token");
 */
export interface SecureStorageHook {
    /**
     * Retrieve the value for `key`. Returns `{ value: null, canRestore: false }`
     * when the key does not exist. Check `canRestore` to determine if a backup
     * copy is available via `restoreItem`.
     */
    getItem(key: string): Promise<{ value: string | null; canRestore: boolean }>;
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
    /** `true` while any storage operation is in flight. */
    loading: Accessor<boolean>;
}

/**
 * Solid hook that provides Promise-based access to the device's secure
 * storage with a reactive `loading` indicator.
 *
 * Must be called inside a component tree wrapped by `<TmaProvider>`.
 *
 * @since Bot API 9.0
 *
 * @example
 * const { getItem, restoreItem } = useSecureStorage();
 * const { value, canRestore } = await getItem("auth_token");
 * if (value === null && canRestore) {
 *   const restored = await restoreItem("auth_token");
 * }
 */
export function useSecureStorage(): SecureStorageHook {
    const { bridge } = useTma();
    const storage = createSecureStorage(bridge.webApp.SecureStorage);
    const [loading, setLoading] = createSignal(false);

    async function run<T>(fn: () => Promise<T>): Promise<T> {
        setLoading(true);
        try {
            return await fn();
        } finally {
            setLoading(false);
        }
    }

    return {
        getItem: (key) => run(() => storage.getItem(key)),
        setItem: (key, value) => run(() => storage.setItem(key, value)),
        restoreItem: (key) => run(() => storage.restoreItem(key)),
        removeItem: (key) => run(() => storage.removeItem(key)),
        clear: () => run(() => storage.clear()),
        loading,
    };
}