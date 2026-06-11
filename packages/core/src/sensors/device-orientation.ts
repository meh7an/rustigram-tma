import { TmaSensorError } from "../errors";
import type { TmaBridge } from "../bridge/tma-bridge";
import type { TelegramDeviceOrientation, TelegramWebApp } from "../types/telegram";
import type { DeviceOrientationStartParams } from "../schemas/sensor-params";

export interface OrientationData {
  readonly absolute: boolean;
  readonly alpha: number;
  readonly beta: number;
  readonly gamma: number;
}

export interface TmaDeviceOrientation {
  start(params?: DeviceOrientationStartParams): Promise<void>;
  stop(): Promise<void>;
  subscribe(callback: (data: OrientationData) => void): () => void;
  getData(): OrientationData | null;
  isRunning(): boolean;
  destroy(): void;
}

export function createDeviceOrientation(
  bridge: TmaBridge,
  sensor: TelegramDeviceOrientation = bridge.webApp.DeviceOrientation,
): TmaDeviceOrientation {
  const subscribers = new Set<(data: OrientationData) => void>();

  function onChanged(this: TelegramWebApp): void {
    const data: OrientationData = {
      absolute: sensor.absolute,
      alpha: sensor.alpha,
      beta: sensor.beta,
      gamma: sensor.gamma,
    };
    for (const cb of subscribers) cb(data);
  }

  bridge.on("deviceOrientationChanged", onChanged);

  return {
    start(params = {}) {
      return new Promise((resolve, reject) => {
        sensor.start(params, (started) => {
          if (started) resolve();
          else reject(new TmaSensorError("DeviceOrientation failed to start."));
        });
      });
    },

    stop() {
      return new Promise((resolve, reject) => {
        sensor.stop((stopped) => {
          if (stopped) resolve();
          else reject(new TmaSensorError("DeviceOrientation failed to stop."));
        });
      });
    },

    subscribe(callback) {
      subscribers.add(callback);
      return () => subscribers.delete(callback);
    },

    getData() {
      if (!sensor.isStarted) return null;
      return { absolute: sensor.absolute, alpha: sensor.alpha, beta: sensor.beta, gamma: sensor.gamma };
    },

    isRunning() {
      return sensor.isStarted;
    },

    destroy() {
      bridge.off("deviceOrientationChanged", onChanged);
      subscribers.clear();
    },
  };
}
