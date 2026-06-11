import { TmaSensorError } from "../errors";
import type { TmaBridge } from "../bridge/tma-bridge";
import type { TelegramGyroscope, TelegramWebApp } from "../types/telegram";
import type { GyroscopeStartParams } from "../schemas/sensor-params";
import type { Vector3D } from "./accelerometer";

export interface TmaGyroscope {
  start(params?: GyroscopeStartParams): Promise<void>;
  stop(): Promise<void>;
  subscribe(callback: (data: Vector3D) => void): () => void;
  getData(): Vector3D | null;
  isRunning(): boolean;
  destroy(): void;
}

export function createGyroscope(
  bridge: TmaBridge,
  sensor: TelegramGyroscope = bridge.webApp.Gyroscope,
): TmaGyroscope {
  const subscribers = new Set<(data: Vector3D) => void>();

  function onChanged(this: TelegramWebApp): void {
    const data: Vector3D = { x: sensor.x, y: sensor.y, z: sensor.z };
    for (const cb of subscribers) cb(data);
  }

  bridge.on("gyroscopeChanged", onChanged);

  return {
    start(params = {}) {
      return new Promise((resolve, reject) => {
        sensor.start(params, (started) => {
          if (started) resolve();
          else reject(new TmaSensorError("Gyroscope failed to start — device may not support it."));
        });
      });
    },

    stop() {
      return new Promise((resolve, reject) => {
        sensor.stop((stopped) => {
          if (stopped) resolve();
          else reject(new TmaSensorError("Gyroscope failed to stop."));
        });
      });
    },

    subscribe(callback) {
      subscribers.add(callback);
      return () => subscribers.delete(callback);
    },

    getData() {
      if (!sensor.isStarted) return null;
      return { x: sensor.x, y: sensor.y, z: sensor.z };
    },

    isRunning() {
      return sensor.isStarted;
    },

    destroy() {
      bridge.off("gyroscopeChanged", onChanged);
      subscribers.clear();
    },
  };
}
