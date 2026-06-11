import type { TmaBridge } from "../bridge/tma-bridge";
import type { TelegramBiometricManager, TelegramWebApp } from "../types/telegram";
import type { BiometricAuthenticateParams, BiometricRequestAccessParams, BiometricType } from "../schemas/biometric";

export interface BiometricStatus {
  readonly isInited: boolean;
  readonly isBiometricAvailable: boolean;
  readonly biometricType: BiometricType;
  readonly isAccessRequested: boolean;
  readonly isAccessGranted: boolean;
  readonly isBiometricTokenSaved: boolean;
  readonly deviceId: string;
}

export interface BiometricAuthResult {
  readonly success: boolean;
  readonly token: string | null;
}

export interface TmaBiometricManager {
  init(): Promise<void>;
  requestAccess(params?: BiometricRequestAccessParams): Promise<boolean>;
  authenticate(params?: BiometricAuthenticateParams): Promise<BiometricAuthResult>;
  updateToken(token: string): Promise<boolean>;
  openSettings(): void;
  getStatus(): BiometricStatus;
  destroy(): void;
}

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
