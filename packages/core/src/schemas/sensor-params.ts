import { z } from "zod";

/**
 * The refresh rate in milliseconds. Acceptable values range from 20 to
 * 1000. Defaults to 1000 when omitted.
 *
 * Note: `refresh_rate` may not be supported on all platforms, so the
 * actual tracking frequency may differ from the specified value.
 */
const refreshRateSchema = z.number().int().min(20).max(1000).optional();

/**
 * Defines the parameters for starting accelerometer tracking via
 * `Accelerometer.start()`.
 *
 * @since Bot API 8.0
 * @see https://core.telegram.org/bots/webapps#accelerometerstartparams
 */
export const AccelerometerStartParamsSchema = z.object({
  /**
   * The refresh rate in milliseconds, with acceptable values ranging from
   * 20 to 1000. Defaults to 1000. The actual tracking frequency may differ
   * from the specified value depending on the platform.
   */
  refresh_rate: refreshRateSchema,
});
export type AccelerometerStartParams = z.infer<typeof AccelerometerStartParamsSchema>;

/**
 * Defines the parameters for starting device orientation tracking via
 * `DeviceOrientation.start()`.
 *
 * @since Bot API 8.0
 * @see https://core.telegram.org/bots/webapps#deviceorientationstartparams
 */
export const DeviceOrientationStartParamsSchema = z.object({
  /**
   * The refresh rate in milliseconds, with acceptable values ranging from
   * 20 to 1000. Defaults to 1000. The actual tracking frequency may differ
   * from the specified value depending on the platform.
   */
  refresh_rate: refreshRateSchema,

  /**
   * Pass `true` to receive absolute orientation data, allowing you to
   * determine the device's attitude relative to magnetic north — useful
   * for implementing a compass. Pass `false` (default) if relative data
   * is sufficient.
   *
   * Note: some devices may not support absolute orientation. In that case,
   * relative data is returned even when `need_absolute` is `true`. Check
   * `DeviceOrientation.absolute` to verify whether the returned data is
   * absolute or relative.
   */
  need_absolute: z.boolean().optional(),
});
export type DeviceOrientationStartParams = z.infer<typeof DeviceOrientationStartParamsSchema>;

/**
 * Defines the parameters for starting gyroscope tracking via
 * `Gyroscope.start()`.
 *
 * @since Bot API 8.0
 * @see https://core.telegram.org/bots/webapps#gyroscopestartparams
 */
export const GyroscopeStartParamsSchema = z.object({
  /**
   * The refresh rate in milliseconds, with acceptable values ranging from
   * 20 to 1000. Defaults to 1000. The actual tracking frequency may differ
   * from the specified value depending on the platform.
   */
  refresh_rate: refreshRateSchema,
});
export type GyroscopeStartParams = z.infer<typeof GyroscopeStartParamsSchema>;