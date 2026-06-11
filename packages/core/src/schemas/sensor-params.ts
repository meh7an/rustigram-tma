import { z } from "zod";

// refresh_rate is clamped to [20, 1000] ms by the Telegram client.
// The actual delivery rate may differ — this is just the requested interval.
const refreshRateSchema = z.number().int().min(20).max(1000).optional();

export const AccelerometerStartParamsSchema = z.object({
  refresh_rate: refreshRateSchema,
});
export type AccelerometerStartParams = z.infer<typeof AccelerometerStartParamsSchema>;

export const DeviceOrientationStartParamsSchema = z.object({
  refresh_rate: refreshRateSchema,
  // When true, requests orientation relative to magnetic north.
  // Some devices ignore this and always return relative orientation.
  need_absolute: z.boolean().optional(),
});
export type DeviceOrientationStartParams = z.infer<typeof DeviceOrientationStartParamsSchema>;

export const GyroscopeStartParamsSchema = z.object({
  refresh_rate: refreshRateSchema,
});
export type GyroscopeStartParams = z.infer<typeof GyroscopeStartParamsSchema>;
