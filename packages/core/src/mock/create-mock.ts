import type {
  BottomButtonParams,
  TelegramAccelerometer,
  TelegramBackButton,
  TelegramBiometricManager,
  TelegramBottomButton,
  TelegramCloudStorage,
  TelegramDeviceOrientation,
  TelegramDeviceStorage,
  TelegramGyroscope,
  TelegramHapticFeedback,
  TelegramLocationManager,
  TelegramSecureStorage,
  TelegramSettingsButton,
  TelegramWebApp,
  TmaEventHandler,
} from "../types/telegram";
import type { TmaEventPayload, TmaEventType } from "../schemas/events";
import type { BiometricType } from "../schemas/biometric";
import type { ColorScheme, ThemeParams } from "../schemas/theme";
import type { ContentSafeAreaInset, SafeAreaInset } from "../schemas/safe-area";
import type { LocationData } from "../schemas/location";
import type { WebAppInitData } from "../schemas/init-data";

// ─── Config ───────────────────────────────────────────────────────────────────

export interface MockBiometricConfig {
  isAvailable?: boolean;
  biometricType?: BiometricType;
  grantAccess?: boolean;
  authenticateSuccess?: boolean;
  token?: string;
}

export interface MockLocationConfig {
  grantAccess?: boolean;
  data?: Partial<LocationData> | null;
}

export interface MockConfig {
  version?: string;
  platform?: string;
  colorScheme?: ColorScheme;
  themeParams?: Partial<ThemeParams>;
  initData?: Partial<WebAppInitData>;
  isActive?: boolean;
  isExpanded?: boolean;
  isFullscreen?: boolean;
  viewportHeight?: number;
  viewportStableHeight?: number;
  safeAreaInset?: Partial<SafeAreaInset>;
  contentSafeAreaInset?: Partial<ContentSafeAreaInset>;
  biometric?: MockBiometricConfig;
  location?: MockLocationConfig;
}

// ─── Public Mock Shape ────────────────────────────────────────────────────────

export interface MockSensorXYZ {
  isStarted: boolean;
  x: number;
  y: number;
  z: number;
}

export interface MockOrientationSensor {
  isStarted: boolean;
  absolute: boolean;
  alpha: number;
  beta: number;
  gamma: number;
}

export interface MockSensors {
  accelerometer: MockSensorXYZ;
  gyroscope: MockSensorXYZ;
  deviceOrientation: MockOrientationSensor;
}

export interface MockStorage {
  cloud: Map<string, string>;
  device: Map<string, string>;
  secure: Map<string, string>;
}

export interface TmaMock {
  webApp: TelegramWebApp;
  sensors: MockSensors;
  storage: MockStorage;
  emit<T extends TmaEventType>(event: T, payload: TmaEventPayload<T>): void;
  reset(config?: MockConfig): void;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_THEME: ThemeParams = {
  bg_color: "#ffffff",
  text_color: "#000000",
  hint_color: "#999999",
  link_color: "#2481cc",
  button_color: "#2481cc",
  button_text_color: "#ffffff",
  secondary_bg_color: "#f1f1f1",
};

const ZERO_INSET: SafeAreaInset = { top: 0, bottom: 0, left: 0, right: 0 };

// ─── Factory ──────────────────────────────────────────────────────────────────

export function createTmaMock(config: MockConfig = {}): TmaMock {
  // ── Event system ────────────────────────────────────────────────────────────

  const handlers = new Map<TmaEventType, Set<TmaEventHandler<TmaEventType>>>();

  function on<T extends TmaEventType>(event: T, handler: TmaEventHandler<T>): void {
    if (!handlers.has(event)) handlers.set(event, new Set());
    handlers.get(event)!.add(handler as TmaEventHandler<TmaEventType>);
  }

  function off<T extends TmaEventType>(event: T, handler: TmaEventHandler<T>): void {
    handlers.get(event)?.delete(handler as TmaEventHandler<TmaEventType>);
  }

  function emit<T extends TmaEventType>(event: T, payload: TmaEventPayload<T>): void {
    for (const handler of handlers.get(event) ?? []) {
      if (payload === undefined) {
        (handler as (this: TelegramWebApp) => void).call(webApp);
      } else {
        (handler as (this: TelegramWebApp, p: TmaEventPayload<T>) => void).call(
          webApp,
          payload,
        );
      }
    }
  }

  // ── Mutable scalar state ────────────────────────────────────────────────────

  let colorScheme: ColorScheme = config.colorScheme ?? "light";
  let themeParams: ThemeParams = { ...DEFAULT_THEME, ...config.themeParams };
  let isActive = config.isActive ?? true;
  let isExpanded = config.isExpanded ?? false;
  let isFullscreen = config.isFullscreen ?? false;
  let isOrientationLocked = false;
  let isClosingConfirmationEnabled = false;
  let isVerticalSwipesEnabled = true;
  let viewportHeight = config.viewportHeight ?? 667;
  let viewportStableHeight = config.viewportStableHeight ?? 667;
  let headerColor = themeParams.bg_color ?? "#ffffff";
  let backgroundColor = themeParams.bg_color ?? "#ffffff";
  let bottomBarColor = themeParams.bottom_bar_bg_color ?? "#ffffff";
  const safeAreaInset: SafeAreaInset = { ...ZERO_INSET, ...config.safeAreaInset };
  const contentSafeAreaInset: ContentSafeAreaInset = { ...ZERO_INSET, ...config.contentSafeAreaInset };

  // ── Storage ─────────────────────────────────────────────────────────────────

  const storage: MockStorage = {
    cloud: new Map(),
    device: new Map(),
    secure: new Map(),
  };

  // ── Sensors ─────────────────────────────────────────────────────────────────

  const sensors: MockSensors = {
    accelerometer: { isStarted: false, x: 0, y: 0, z: 0 },
    gyroscope: { isStarted: false, x: 0, y: 0, z: 0 },
    deviceOrientation: { isStarted: false, absolute: false, alpha: 0, beta: 0, gamma: 0 },
  };

  // ── Button state ────────────────────────────────────────────────────────────

  let backButtonVisible = false;
  let settingsButtonVisible = false;

  interface BottomBtnState {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    hasShineEffect: boolean;
    position: "left" | "right" | "top" | "bottom";
    iconCustomEmojiId: string;
  }

  const mainBtnState: BottomBtnState = {
    text: "Continue",
    color: "#2481cc",
    textColor: "#ffffff",
    isVisible: false,
    isActive: true,
    isProgressVisible: false,
    hasShineEffect: false,
    position: "left",
    iconCustomEmojiId: "",
  };

  const secondaryBtnState: BottomBtnState = {
    text: "Cancel",
    color: "#f1f1f1",
    textColor: "#2481cc",
    isVisible: false,
    isActive: true,
    isProgressVisible: false,
    hasShineEffect: false,
    position: "left",
    iconCustomEmojiId: "",
  };

  // ── Auth state ──────────────────────────────────────────────────────────────

  const bCfg = config.biometric ?? {};
  let biometricInited = false;
  let biometricAccessGranted = false;
  const lCfg = config.location ?? {};
  let locationInited = false;

  // ── Sub-Objects ─────────────────────────────────────────────────────────────

  const BackButton: TelegramBackButton = {
    get isVisible() { return backButtonVisible; },
    show() { backButtonVisible = true; return BackButton; },
    hide() { backButtonVisible = false; return BackButton; },
    onClick(cb) {
      on("backButtonClicked", cb as TmaEventHandler<"backButtonClicked">);
      return BackButton;
    },
    offClick(cb) {
      off("backButtonClicked", cb as TmaEventHandler<"backButtonClicked">);
      return BackButton;
    },
  };

  function makeBottomButton(
    type: "main" | "secondary",
    s: BottomBtnState,
    event: "mainButtonClicked" | "secondaryButtonClicked",
  ): TelegramBottomButton {
    const btn: TelegramBottomButton = {
      get type() { return type; },
      get text() { return s.text; },
      get color() { return s.color; },
      get textColor() { return s.textColor; },
      get isVisible() { return s.isVisible; },
      get isActive() { return s.isActive; },
      get isProgressVisible() { return s.isProgressVisible; },
      get hasShineEffect() { return s.hasShineEffect; },
      get position() { return s.position; },
      get iconCustomEmojiId() { return s.iconCustomEmojiId; },
      setParams(p: BottomButtonParams) {
        if (p.text !== undefined) s.text = p.text;
        if (p.color !== undefined) s.color = p.color;
        if (p.text_color !== undefined) s.textColor = p.text_color;
        if (p.has_shine_effect !== undefined) s.hasShineEffect = p.has_shine_effect;
        if (p.position !== undefined) s.position = p.position;
        if (p.is_active !== undefined) s.isActive = p.is_active;
        if (p.is_visible !== undefined) s.isVisible = p.is_visible;
        if (p.icon_custom_emoji_id !== undefined) s.iconCustomEmojiId = p.icon_custom_emoji_id;
        return btn;
      },
      setText(text) { s.text = text; return btn; },
      show() { s.isVisible = true; return btn; },
      hide() { s.isVisible = false; return btn; },
      enable() { s.isActive = true; return btn; },
      disable() { s.isActive = false; return btn; },
      showProgress(leaveActive = false) {
        s.isProgressVisible = true;
        if (!leaveActive) s.isActive = false;
        return btn;
      },
      hideProgress() { s.isProgressVisible = false; s.isActive = true; return btn; },
      onClick(cb) { on(event, cb as TmaEventHandler<typeof event>); return btn; },
      offClick(cb) { off(event, cb as TmaEventHandler<typeof event>); return btn; },
    };
    return btn;
  }

  const MainButton = makeBottomButton("main", mainBtnState, "mainButtonClicked");
  const SecondaryButton = makeBottomButton("secondary", secondaryBtnState, "secondaryButtonClicked");

  const SettingsButton: TelegramSettingsButton = {
    get isVisible() { return settingsButtonVisible; },
    show() { settingsButtonVisible = true; return SettingsButton; },
    hide() { settingsButtonVisible = false; return SettingsButton; },
    onClick(cb) {
      on("settingsButtonClicked", cb as TmaEventHandler<"settingsButtonClicked">);
      return SettingsButton;
    },
    offClick(cb) {
      off("settingsButtonClicked", cb as TmaEventHandler<"settingsButtonClicked">);
      return SettingsButton;
    },
  };

  const HapticFeedback: TelegramHapticFeedback = {
    impactOccurred() { return HapticFeedback; },
    notificationOccurred() { return HapticFeedback; },
    selectionChanged() { return HapticFeedback; },
  };

  const CloudStorage: TelegramCloudStorage = {
    getItem(key, cb) { cb(null, storage.cloud.get(key)); return CloudStorage; },
    setItem(key, value, cb) { storage.cloud.set(key, value); cb?.(null, true); return CloudStorage; },
    getItems(keys, cb) {
      const result: Record<string, string> = {};
      for (const key of keys) {
        const val = storage.cloud.get(key);
        if (val !== undefined) result[key] = val;
      }
      cb(null, result);
      return CloudStorage;
    },
    removeItem(key, cb) { storage.cloud.delete(key); cb?.(null, true); return CloudStorage; },
    removeItems(keys, cb) {
      for (const key of keys) storage.cloud.delete(key);
      cb?.(null, true);
      return CloudStorage;
    },
    getKeys(cb) { cb(null, [...storage.cloud.keys()]); return CloudStorage; },
  };

  const DeviceStorage: TelegramDeviceStorage = {
    getItem(key, cb) { cb(null, storage.device.get(key)); return DeviceStorage; },
    setItem(key, value, cb) { storage.device.set(key, value); cb?.(null, true); return DeviceStorage; },
    removeItem(key, cb) { storage.device.delete(key); cb?.(null, true); return DeviceStorage; },
    clear(cb) { storage.device.clear(); cb?.(null, true); return DeviceStorage; },
  };

  const SecureStorage: TelegramSecureStorage = {
    getItem(key, cb) {
      cb(null, storage.secure.get(key) ?? null, false);
      return SecureStorage;
    },
    setItem(key, value, cb) { storage.secure.set(key, value); cb?.(null, true); return SecureStorage; },
    restoreItem(key, cb) { cb(null, storage.secure.get(key)); return SecureStorage; },
    removeItem(key, cb) { storage.secure.delete(key); cb?.(null, true); return SecureStorage; },
    clear(cb) { storage.secure.clear(); cb?.(null, true); return SecureStorage; },
  };

  const BiometricManager: TelegramBiometricManager = {
    get isInited() { return biometricInited; },
    get isBiometricAvailable() { return bCfg.isAvailable ?? true; },
    get biometricType() { return bCfg.biometricType ?? "finger"; },
    get isAccessRequested() { return biometricInited; },
    get isAccessGranted() { return biometricAccessGranted; },
    get isBiometricTokenSaved() { return !!bCfg.token; },
    get deviceId() { return "mock-device-id"; },
    init(cb) { biometricInited = true; cb?.(); return BiometricManager; },
    requestAccess(_p, cb) {
      biometricAccessGranted = bCfg.grantAccess ?? true;
      cb?.(biometricAccessGranted);
      return BiometricManager;
    },
    authenticate(_p, cb) {
      const success = bCfg.authenticateSuccess ?? true;
      cb?.(success, success ? (bCfg.token ?? "mock-token") : undefined);
      return BiometricManager;
    },
    updateBiometricToken(_t, cb) { cb?.(true); return BiometricManager; },
    openSettings() { return BiometricManager; },
  };

  const LocationManager: TelegramLocationManager = {
    get isInited() { return locationInited; },
    get isLocationAvailable() { return lCfg.grantAccess !== false; },
    get isAccessRequested() { return locationInited; },
    get isAccessGranted() { return locationInited && lCfg.grantAccess !== false; },
    init(cb) { locationInited = true; cb?.(); return LocationManager; },
    getLocation(cb) {
      if (!locationInited || lCfg.grantAccess === false) {
        cb(null);
        return LocationManager;
      }
      cb({
        latitude: lCfg.data?.latitude ?? 37.7749,
        longitude: lCfg.data?.longitude ?? -122.4194,
        altitude: lCfg.data?.altitude ?? null,
        course: lCfg.data?.course ?? null,
        speed: lCfg.data?.speed ?? null,
        horizontal_accuracy: lCfg.data?.horizontal_accuracy ?? null,
        vertical_accuracy: lCfg.data?.vertical_accuracy ?? null,
        course_accuracy: lCfg.data?.course_accuracy ?? null,
        speed_accuracy: lCfg.data?.speed_accuracy ?? null,
      });
      return LocationManager;
    },
    openSettings() { return LocationManager; },
  };

  const Accelerometer: TelegramAccelerometer = {
    get isStarted() { return sensors.accelerometer.isStarted; },
    get x() { return sensors.accelerometer.x; },
    get y() { return sensors.accelerometer.y; },
    get z() { return sensors.accelerometer.z; },
    start(_p, cb) { sensors.accelerometer.isStarted = true; cb?.(true); return Accelerometer; },
    stop(cb) { sensors.accelerometer.isStarted = false; cb?.(true); return Accelerometer; },
  };

  const Gyroscope: TelegramGyroscope = {
    get isStarted() { return sensors.gyroscope.isStarted; },
    get x() { return sensors.gyroscope.x; },
    get y() { return sensors.gyroscope.y; },
    get z() { return sensors.gyroscope.z; },
    start(_p, cb) { sensors.gyroscope.isStarted = true; cb?.(true); return Gyroscope; },
    stop(cb) { sensors.gyroscope.isStarted = false; cb?.(true); return Gyroscope; },
  };

  const DeviceOrientation: TelegramDeviceOrientation = {
    get isStarted() { return sensors.deviceOrientation.isStarted; },
    get absolute() { return sensors.deviceOrientation.absolute; },
    get alpha() { return sensors.deviceOrientation.alpha; },
    get beta() { return sensors.deviceOrientation.beta; },
    get gamma() { return sensors.deviceOrientation.gamma; },
    start(_p, cb) { sensors.deviceOrientation.isStarted = true; cb?.(true); return DeviceOrientation; },
    stop(cb) { sensors.deviceOrientation.isStarted = false; cb?.(true); return DeviceOrientation; },
  };

  // ── isVersionAtLeast ────────────────────────────────────────────────────────

  function isVersionAtLeast(v: string): boolean {
    const parse = (s: string): [number, number] => {
      const parts = s.split(".");
      return [Number(parts[0] ?? "0"), Number(parts[1] ?? "0")];
    };
    const [maj, min] = parse(v);
    const [curMaj, curMin] = parse(config.version ?? "8.0");
    return curMaj > maj || (curMaj === maj && curMin >= min);
  }

  // ── WebApp object ───────────────────────────────────────────────────────────

  const webApp: TelegramWebApp = {
    get initData() { return config.initData ? new URLSearchParams(config.initData as Record<string, string>).toString() : ""; },
    get initDataUnsafe() { return { auth_date: Math.floor(Date.now() / 1000), hash: "mock-hash", ...config.initData }; },
    get version() { return config.version ?? "8.0"; },
    get platform() { return config.platform ?? "unknown"; },

    get colorScheme() { return colorScheme; },
    get themeParams() { return themeParams; },
    get isActive() { return isActive; },
    get isExpanded() { return isExpanded; },
    get isFullscreen() { return isFullscreen; },
    get isOrientationLocked() { return isOrientationLocked; },
    get isClosingConfirmationEnabled() { return isClosingConfirmationEnabled; },
    get isVerticalSwipesEnabled() { return isVerticalSwipesEnabled; },
    get viewportHeight() { return viewportHeight; },
    get viewportStableHeight() { return viewportStableHeight; },
    get headerColor() { return headerColor; },
    get backgroundColor() { return backgroundColor; },
    get bottomBarColor() { return bottomBarColor; },
    get safeAreaInset() { return safeAreaInset; },
    get contentSafeAreaInset() { return contentSafeAreaInset; },

    BackButton,
    MainButton,
    SecondaryButton,
    SettingsButton,
    HapticFeedback,
    CloudStorage,
    DeviceStorage,
    SecureStorage,
    BiometricManager,
    Accelerometer,
    DeviceOrientation,
    Gyroscope,
    LocationManager,

    ready() { },
    expand() { isExpanded = true; },
    close() { },
    isVersionAtLeast,

    setHeaderColor(color) { headerColor = color; },
    setBackgroundColor(color) { backgroundColor = color; },
    setBottomBarColor(color) { bottomBarColor = color; },

    enableClosingConfirmation() { isClosingConfirmationEnabled = true; },
    disableClosingConfirmation() { isClosingConfirmationEnabled = false; },
    enableVerticalSwipes() { isVerticalSwipesEnabled = true; },
    disableVerticalSwipes() { isVerticalSwipesEnabled = false; },

    requestFullscreen() { isFullscreen = true; emit("fullscreenChanged", undefined); },
    exitFullscreen() { isFullscreen = false; emit("fullscreenChanged", undefined); },
    lockOrientation() { isOrientationLocked = true; },
    unlockOrientation() { isOrientationLocked = false; },

    addToHomeScreen() { emit("homeScreenAdded", undefined); },
    checkHomeScreenStatus(cb) { cb?.("unknown"); emit("homeScreenChecked", { status: "unknown" }); },

    sendData() { },
    openLink() { },
    openTelegramLink() { },
    openInvoice(_url, cb) { cb?.("cancelled"); },
    switchInlineQuery() { },

    showPopup(_p, cb) { cb?.("ok"); },
    showAlert(_m, cb) { cb?.(); },
    showConfirm(_m, cb) { cb?.(true); },
    hideKeyboard() { },

    showScanQrPopup() { },
    closeScanQrPopup() { },
    readTextFromClipboard(cb) { cb?.(null); },

    requestWriteAccess(cb) { cb?.(false); emit("writeAccessRequested", { status: "cancelled" }); },
    requestContact(cb) { cb?.(false); emit("contactRequested", { status: "cancelled" }); },

    shareToStory() { },
    shareMessage(_id, cb) { cb?.(true); emit("shareMessageSent", undefined); },
    downloadFile(_p, cb) { cb?.(true); emit("fileDownloadRequested", { status: "downloading" }); },

    setEmojiStatus(_id, _p, cb) { cb?.(true); emit("emojiStatusSet", undefined); },
    requestEmojiStatusAccess(cb) {
      cb?.(true);
      emit("emojiStatusAccessRequested", { status: "allowed" });
    },
    requestChat(_id, cb) { cb?.(true); },

    onEvent: on,
    offEvent: off,
  };

  // ── reset ───────────────────────────────────────────────────────────────────

  function reset(newConfig: MockConfig = config): void {
    colorScheme = newConfig.colorScheme ?? "light";
    themeParams = { ...DEFAULT_THEME, ...newConfig.themeParams };
    isActive = newConfig.isActive ?? true;
    isExpanded = newConfig.isExpanded ?? false;
    isFullscreen = newConfig.isFullscreen ?? false;
    isOrientationLocked = false;
    isClosingConfirmationEnabled = false;
    isVerticalSwipesEnabled = true;
    viewportHeight = newConfig.viewportHeight ?? 667;
    viewportStableHeight = newConfig.viewportStableHeight ?? 667;
    headerColor = themeParams.bg_color ?? "#ffffff";
    backgroundColor = themeParams.bg_color ?? "#ffffff";
    bottomBarColor = themeParams.bottom_bar_bg_color ?? "#ffffff";

    backButtonVisible = false;
    settingsButtonVisible = false;
    Object.assign(mainBtnState, {
      text: "Continue", isVisible: false, isActive: true, isProgressVisible: false,
    });
    Object.assign(secondaryBtnState, {
      text: "Cancel", isVisible: false, isActive: true, isProgressVisible: false,
    });

    storage.cloud.clear();
    storage.device.clear();
    storage.secure.clear();

    Object.assign(sensors.accelerometer, { isStarted: false, x: 0, y: 0, z: 0 });
    Object.assign(sensors.gyroscope, { isStarted: false, x: 0, y: 0, z: 0 });
    Object.assign(sensors.deviceOrientation, { isStarted: false, absolute: false, alpha: 0, beta: 0, gamma: 0 });

    biometricInited = false;
    biometricAccessGranted = false;
    locationInited = false;

    handlers.clear();
  }

  return { webApp, sensors, storage, emit, reset };
}
