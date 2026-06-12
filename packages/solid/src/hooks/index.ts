import { createSignal, onCleanup } from "solid-js";
import type { Accessor } from "solid-js";
import {
  createCloudStorage,
  createDeviceStorage,
  createSecureStorage,
  createAccelerometer,
  createGyroscope,
  createDeviceOrientation,
  createBiometricManager,
  createLocationManager,
} from "@rustigram/tma-core";
import type {
  BiometricAuthResult,
  BiometricStatus,
  LocationManagerStatus,
  Vector3D,
  OrientationData,
  BiometricRequestAccessParams,
  BiometricAuthenticateParams,
  AccelerometerStartParams,
  GyroscopeStartParams,
  DeviceOrientationStartParams,
  LocationData,
} from "@rustigram/tma-core";
import { useTma } from "../provider/use-tma";

// ─── Storage ──────────────────────────────────────────────────────────────────

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
    try { return await fn(); } finally { setLoading(false); }
  }

  return {
    getItem: (key) => run(() => storage.getItem(key)),
    setItem: (key, value) => run(() => storage.setItem(key, value)),
    removeItem: (key) => run(() => storage.removeItem(key)),
    clear: () => run(() => storage.clear()),
    loading,
  };
}

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
    try { return await fn(); } finally { setLoading(false); }
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

// ─── Sensors ──────────────────────────────────────────────────────────────────

/**
 * Return value of `useAccelerometer()`.
 *
 * @since Bot API 8.0
 */
export interface AccelerometerHook {
  /** Start accelerometer tracking. Rejects with `TmaSensorError` if unsupported. */
  start(params?: AccelerometerStartParams): Promise<void>;
  /** Stop accelerometer tracking and clear the `data` signal. */
  stop(): Promise<void>;
  /** Reactive signal with the latest `Vector3D` reading in m/s², or `null` when not started. */
  data: Accessor<Vector3D | null>;
  /** Reactive signal that is `true` while tracking is active. */
  isRunning: Accessor<boolean>;
}

/**
 * Solid hook for reactive accelerometer data.
 *
 * Creates a `TmaAccelerometer` instance, subscribes to readings, and exposes
 * them as a reactive `data` signal. Automatically destroys the sensor on
 * component cleanup.
 *
 * Must be called inside a component tree wrapped by `<TmaProvider>`.
 *
 * @since Bot API 8.0
 *
 * @example
 * const { start, data, isRunning } = useAccelerometer();
 * await start({ refresh_rate: 100 });
 * createEffect(() => console.log(data()?.x));
 */
export function useAccelerometer(): AccelerometerHook {
  const { bridge } = useTma();
  const acc = createAccelerometer(bridge);
  const [data, setData] = createSignal<Vector3D | null>(null);
  const [isRunning, setIsRunning] = createSignal(false);

  const unsubscribe = acc.subscribe((d) => setData(() => d));
  onCleanup(() => { unsubscribe(); acc.destroy(); });

  return {
    start: async (params?) => { await acc.start(params); setIsRunning(true); },
    stop: async () => { await acc.stop(); setIsRunning(false); setData(null); },
    data,
    isRunning,
  };
}

/**
 * Return value of `useGyroscope()`.
 *
 * @since Bot API 8.0
 */
export interface GyroscopeHook {
  /** Start gyroscope tracking. Rejects with `TmaSensorError` if unsupported. */
  start(params?: GyroscopeStartParams): Promise<void>;
  /** Stop gyroscope tracking and clear the `data` signal. */
  stop(): Promise<void>;
  /** Reactive signal with the latest `Vector3D` reading in rad/s, or `null` when not started. */
  data: Accessor<Vector3D | null>;
  /** Reactive signal that is `true` while tracking is active. */
  isRunning: Accessor<boolean>;
}

/**
 * Solid hook for reactive gyroscope data.
 *
 * Creates a `TmaGyroscope` instance, subscribes to readings, and exposes
 * them as a reactive `data` signal. Automatically destroys the sensor on
 * component cleanup.
 *
 * Must be called inside a component tree wrapped by `<TmaProvider>`.
 *
 * @since Bot API 8.0
 *
 * @example
 * const { start, data } = useGyroscope();
 * await start({ refresh_rate: 100 });
 * createEffect(() => console.log(data()?.z));
 */
export function useGyroscope(): GyroscopeHook {
  const { bridge } = useTma();
  const gyro = createGyroscope(bridge);
  const [data, setData] = createSignal<Vector3D | null>(null);
  const [isRunning, setIsRunning] = createSignal(false);

  const unsubscribe = gyro.subscribe((d) => setData(() => d));
  onCleanup(() => { unsubscribe(); gyro.destroy(); });

  return {
    start: async (params?) => { await gyro.start(params); setIsRunning(true); },
    stop: async () => { await gyro.stop(); setIsRunning(false); setData(null); },
    data,
    isRunning,
  };
}

/**
 * Return value of `useDeviceOrientation()`.
 *
 * @since Bot API 8.0
 */
export interface DeviceOrientationHook {
  /** Start orientation tracking. Rejects with `TmaSensorError` if unsupported. */
  start(params?: DeviceOrientationStartParams): Promise<void>;
  /** Stop orientation tracking and clear the `data` signal. */
  stop(): Promise<void>;
  /**
   * Reactive signal with the latest `OrientationData` snapshot, or `null`
   * when not started. Check `data()?.absolute` to verify whether the data
   * is relative to magnetic north.
   */
  data: Accessor<OrientationData | null>;
  /** Reactive signal that is `true` while tracking is active. */
  isRunning: Accessor<boolean>;
}

/**
 * Solid hook for reactive device orientation data.
 *
 * Creates a `TmaDeviceOrientation` instance, subscribes to readings, and
 * exposes them as a reactive `data` signal. Automatically destroys the
 * sensor on component cleanup.
 *
 * Pass `need_absolute: true` in `start()` params for compass-style features.
 * Check `data()?.absolute` to verify whether absolute data was actually
 * provided — some devices ignore the request.
 *
 * Must be called inside a component tree wrapped by `<TmaProvider>`.
 *
 * @since Bot API 8.0
 *
 * @example
 * const { start, data } = useDeviceOrientation();
 * await start({ need_absolute: true });
 * createEffect(() => {
 *   const d = data();
 *   if (d?.absolute) console.log(`Heading: ${d.alpha}°`);
 * });
 */
export function useDeviceOrientation(): DeviceOrientationHook {
  const { bridge } = useTma();
  const orient = createDeviceOrientation(bridge);
  const [data, setData] = createSignal<OrientationData | null>(null);
  const [isRunning, setIsRunning] = createSignal(false);

  const unsubscribe = orient.subscribe((d) => setData(() => d));
  onCleanup(() => { unsubscribe(); orient.destroy(); });

  return {
    start: async (params?) => { await orient.start(params); setIsRunning(true); },
    stop: async () => { await orient.stop(); setIsRunning(false); setData(null); },
    data,
    isRunning,
  };
}

/**
 * Return value of `useBiometric()`.
 *
 * @since Bot API 7.2
 */
export interface BiometricHook {
  /** Initialise the `BiometricManager`. Must be called before any other method. */
  init(): Promise<void>;
  /** Request biometric access. Returns `true` if the user granted it. */
  requestAccess(params?: BiometricRequestAccessParams): Promise<boolean>;
  /** Authenticate the user. Returns success state and the stored token. */
  authenticate(params?: BiometricAuthenticateParams): Promise<BiometricAuthResult>;
  /**
   * Save or update the biometric token. Pass an empty string to clear it.
   * Returns `true` if the update succeeded.
   */
  updateToken(token: string): Promise<boolean>;
  /**
   * Open Telegram's settings page for this bot's biometric permissions.
   * Must be called in response to a direct user interaction.
   */
  openSettings(): void;
  /** Reactive signal with the current `BiometricStatus` snapshot. */
  status: Accessor<BiometricStatus>;
}

/**
 * Solid hook for reactive biometric authentication.
 *
 * Creates a `TmaBiometricManager` instance and keeps a reactive `status`
 * signal in sync with `biometricManagerUpdated` events. Automatically
 * removes event listeners on component cleanup.
 *
 * Must be called inside a component tree wrapped by `<TmaProvider>`.
 *
 * @since Bot API 7.2
 *
 * @example
 * const { init, requestAccess, authenticate, status } = useBiometric();
 * await init();
 * const granted = await requestAccess({ reason: "Authenticate to continue" });
 * if (granted) {
 *   const { success, token } = await authenticate();
 * }
 */
export function useBiometric(): BiometricHook {
  const { bridge } = useTma();
  const bm = createBiometricManager(bridge);
  const [status, setStatus] = createSignal<BiometricStatus>(bm.getStatus());

  function refreshStatus() { setStatus(() => bm.getStatus()); }
  bridge.on("biometricManagerUpdated", refreshStatus);
  onCleanup(() => { bridge.off("biometricManagerUpdated", refreshStatus); bm.destroy(); });

  return {
    init: async () => { await bm.init(); refreshStatus(); },
    requestAccess: async (params?) => { const g = await bm.requestAccess(params); refreshStatus(); return g; },
    authenticate: async (params?) => { const r = await bm.authenticate(params); refreshStatus(); return r; },
    updateToken: (token) => bm.updateToken(token),
    openSettings: () => bm.openSettings(),
    status,
  };
}

/**
 * Return value of `useLocation()`.
 *
 * @since Bot API 8.0
 */
export interface LocationHook {
  /** Initialise the `LocationManager`. Must be called before any other method. */
  init(): Promise<void>;
  /**
   * Request the current location. Returns `null` if access is denied or
   * location services are unavailable.
   */
  getLocation(): Promise<LocationData | null>;
  /**
   * Open Telegram's settings page for this bot's location permissions.
   * Must be called in response to a direct user interaction.
   */
  openSettings(): void;
  /** Reactive signal with the current `LocationManagerStatus` snapshot. */
  status: Accessor<LocationManagerStatus>;
}

/**
 * Solid hook for reactive location access.
 *
 * Creates a `TmaLocationManager` instance and keeps a reactive `status`
 * signal in sync with `locationManagerUpdated` events. Automatically
 * removes event listeners on component cleanup.
 *
 * Must be called inside a component tree wrapped by `<TmaProvider>`.
 *
 * @since Bot API 8.0
 *
 * @example
 * const { init, getLocation, status } = useLocation();
 * await init();
 * const data = await getLocation();
 * if (data) console.log(`${data.latitude}, ${data.longitude}`);
 */
export function useLocation(): LocationHook {
  const { bridge } = useTma();
  const lm = createLocationManager(bridge);
  const [status, setStatus] = createSignal<LocationManagerStatus>(lm.getStatus());

  function refreshStatus() { setStatus(() => lm.getStatus()); }
  bridge.on("locationManagerUpdated", refreshStatus);
  onCleanup(() => { bridge.off("locationManagerUpdated", refreshStatus); lm.destroy(); });

  return {
    init: async () => { await lm.init(); refreshStatus(); },
    getLocation: () => lm.getLocation(),
    openSettings: () => lm.openSettings(),
    status,
  };
}