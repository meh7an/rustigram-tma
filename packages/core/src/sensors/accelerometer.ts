import { TmaSensorError } from "../errors";
import type { TmaBridge } from "../bridge/tma-bridge";
import type { TelegramAccelerometer, TelegramWebApp } from "../types/telegram";
import type { AccelerometerStartParams } from "../schemas/sensor-params";

export interface Vector3D {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface TmaAccelerometer {
  start(params?: AccelerometerStartParams): Promise<void>;
  stop(): Promise<void>;
  subscribe(callback: (data: Vector3D) => void): () => void;
  getData(): Vector3D | null;
  isRunning(): boolean;
  destroy(): void;
}

export function createAccelerometer(
  bridge: TmaBridge,
  sensor: TelegramAccelerometer = bridge.webApp.Accelerometer,
): TmaAccelerometer {
  const subscribers = new Set<(data: Vector3D) => void>();

  function onChanged(this: TelegramWebApp): void {
    const data: Vector3D = { x: sensor.x, y: sensor.y, z: sensor.z };
    for (const cb of subscribers) cb(data);
  }

  bridge.on("accelerometerChanged", onChanged);

  return {
    start(params = {}) {
      return new Promise((resolve, reject) => {
        sensor.start(params, (started) => {
          if (started) resolve();
          else reject(new TmaSensorError("Accelerometer failed to start — device may not support it."));
        });
      });
    },

    stop() {
      return new Promise((resolve, reject) => {
        sensor.stop((stopped) => {
          if (stopped) resolve();
          else reject(new TmaSensorError("Accelerometer failed to stop."));
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
      bridge.off("accelerometerChanged", onChanged);
      subscribers.clear();
    },
  };
}
