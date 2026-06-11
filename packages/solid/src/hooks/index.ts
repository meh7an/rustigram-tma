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
  TmaCloudStorage,
  TmaDeviceStorage,
  TmaSecureStorage,
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

// ─── Storage ─────────────────────────────────────────────────────────────────

interface StorageHook<S> {
  store: S;
  loading: Accessor<boolean>;
}

function useStorageBase<S>(factory: () => S): StorageHook<S> {
  const store = factory();
  const [loading, setLoading] = createSignal(false);

  // Wrap each method with a loading flag. The returned object exposes the
  // original methods; callers opt in to using `loading` if they want it.
  const wrap =
    <T>(fn: () => Promise<T>): (() => Promise<T>) =>
    async () => {
      setLoading(true);
      try {
        return await fn();
      } finally {
        setLoading(false);
      }
    };

  return { store: store as S, loading };
}

export interface CloudStorageHook {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  removeItems(keys: string[]): Promise<void>;
  getItems(keys: string[]): Promise<Record<string, string | null>>;
  getKeys(): Promise<string[]>;
  loading: Accessor<boolean>;
}

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

export interface DeviceStorageHook {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  loading: Accessor<boolean>;
}

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

export interface SecureStorageHook {
  getItem(key: string): Promise<{ value: string | null; canRestore: boolean }>;
  setItem(key: string, value: string): Promise<void>;
  restoreItem(key: string): Promise<string | null>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  loading: Accessor<boolean>;
}

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

export interface AccelerometerHook {
  start(params?: AccelerometerStartParams): Promise<void>;
  stop(): Promise<void>;
  data: Accessor<Vector3D | null>;
  isRunning: Accessor<boolean>;
}

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

export interface GyroscopeHook {
  start(params?: GyroscopeStartParams): Promise<void>;
  stop(): Promise<void>;
  data: Accessor<Vector3D | null>;
  isRunning: Accessor<boolean>;
}

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

export interface DeviceOrientationHook {
  start(params?: DeviceOrientationStartParams): Promise<void>;
  stop(): Promise<void>;
  data: Accessor<OrientationData | null>;
  isRunning: Accessor<boolean>;
}

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

export interface BiometricHook {
  init(): Promise<void>;
  requestAccess(params?: BiometricRequestAccessParams): Promise<boolean>;
  authenticate(params?: BiometricAuthenticateParams): Promise<BiometricAuthResult>;
  updateToken(token: string): Promise<boolean>;
  openSettings(): void;
  status: Accessor<BiometricStatus>;
}

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

export interface LocationHook {
  init(): Promise<void>;
  getLocation(): Promise<LocationData | null>;
  openSettings(): void;
  status: Accessor<LocationManagerStatus>;
}

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
