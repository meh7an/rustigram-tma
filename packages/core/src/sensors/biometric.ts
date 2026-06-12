import type { TmaBridge } from "../bridge/tma-bridge";
import type { TelegramBiometricManager, TelegramWebApp } from "../types/telegram";
import type { BiometricAuthenticateParams, BiometricRequestAccessParams, BiometricType } from "../schemas/biometric";

/**
 * A point-in-time snapshot of `BiometricManager` state fields. Retrieve via
 * `TmaBiometricManager.getStatus()`.
 */
export interface BiometricStatus {
  /** Whether `init()` has completed. */
  readonly isInited: boolean;
  /** Whether biometric authentication is available on this device. */
  readonly isBiometricAvailable: boolean;
  /** The type of biometric authentication supported by the device. */
  readonly biometricType: BiometricType;
  /** Whether the bot has previously requested biometric access. */
  readonly isAccessRequested: boolean;
  /** Whether the user has granted biometric access to the bot. */
  readonly isAccessGranted: boolean;
  /** Whether a biometric token is currently saved in secure storage. */
  readonly isBiometricTokenSaved: boolean;
  /**
   * A unique device identifier — stable per bot and device, changes on
   * app reinstall.
   */
  readonly deviceId: string;
}

/**
 * The result of a `TmaBiometricManager.authenticate()` call.
 */
export interface BiometricAuthResult {
  /** Whether the user authenticated successfully. */
  readonly success: boolean;
  /**
   * The biometric token stored in secure storage, or `null` if
   * authentication failed or no token was saved.
   */
  readonly token: string | null;
}

/**
 * Promise-based wrapper around `TelegramBiometricManager`.
 *
 * Wraps the callback-based `BiometricManager` API into async methods.
 * Must be initialised by calling `init()` before any other method.
 *
 * Obtain an instance via `createBiometricManager(bridge)`. Call `destroy()`
 * when done to remove the `biometricManagerUpdated` event listener.
 *
 * @since Bot API 7.2
 * @see https://core.telegram.org/bots/webapps#biometricmanager
 *
 * @example
 * const biometric = createBiometricManager(bridge);
 * await biometric.init();
 * const granted = await biometric.requestAccess({ reason: "Authenticate to continue" });
 * if (granted) {
 *   const { success, token } = await biometric.authenticate();
 * }
 */
export interface TmaBiometricManager {
  /**
   * Initialise the `BiometricManager`. Must be called before any other
   * method.
   */
  init(): Promise<void>;

  /**
   * Show the native permission request popup. Returns `true` if the user
   * granted access.
   */
  requestAccess(params?: BiometricRequestAccessParams): Promise<boolean>;

  /**
   * Authenticate the user using biometrics. Returns a `BiometricAuthResult`
   * with `success: true` and the stored token if authentication succeeded.
   */
  authenticate(params?: BiometricAuthenticateParams): Promise<BiometricAuthResult>;

  /**
   * Save or update the biometric token in the device's secure storage.
   * Pass an empty string to clear the saved token. Returns `true` if the
   * update succeeded.
   */
  updateToken(token: string): Promise<boolean>;

  /**
   * Open the Telegram settings page for this bot's biometric permissions.
   * Must be called in response to a direct user interaction.
   */
  openSettings(): void;

  /** Return the current `BiometricStatus` snapshot. */
  getStatus(): BiometricStatus;

  /**
   * Remove the `biometricManagerUpdated` event listener. Call this when
   * the manager is no longer needed.
   */
  destroy(): void;
}

/**
 * Create a `TmaBiometricManager` instance backed by the given bridge.
 *
 * @param bridge - A `TmaBridge` instance returned by `initBridge()`.
 * @param manager - Defaults to `bridge.webApp.BiometricManager`. Override in tests.
 *
 * @example
 * const biometric = createBiometricManager(bridge);
 * await biometric.init();
 */
export function createBiometricManager(
  bridge: TmaBridge,
  manager: TelegramBiometricManager = bridge.webApp.BiometricManager,
): TmaBiometricManager {
  const subscribers = new Set<() => void>();

  function onUpdated(this: TelegramWebApp): void {
    for (const cb of subscribers) cb();
  }

  bridge.on("biometricManagerUpdated", onUpdated);

  return {
    init() {
      return new Promise((resolve) => {
        manager.init(() => resolve());
      });
    },

    requestAccess(params = {}) {
      return new Promise((resolve) => {
        manager.requestAccess(params, (granted) => resolve(granted));
      });
    },

    authenticate(params = {}) {
      return new Promise((resolve) => {
        manager.authenticate(params, (success, token) => {
          resolve({ success, token: token ?? null });
        });
      });
    },

    updateToken(token) {
      return new Promise((resolve) => {
        manager.updateBiometricToken(token, (updated) => resolve(updated));
      });
    },

    openSettings() {
      manager.openSettings();
    },

    getStatus() {
      return {
        isInited: manager.isInited,
        isBiometricAvailable: manager.isBiometricAvailable,
        biometricType: manager.biometricType,
        isAccessRequested: manager.isAccessRequested,
        isAccessGranted: manager.isAccessGranted,
        isBiometricTokenSaved: manager.isBiometricTokenSaved,
        deviceId: manager.deviceId,
      };
    },

    destroy() {
      bridge.off("biometricManagerUpdated", onUpdated);
      subscribers.clear();
    },
  };
}