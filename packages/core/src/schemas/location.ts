import { z } from "zod";

/**
 * Contains data about the device's current location.
 *
 * @see https://core.telegram.org/bots/webapps#locationdata
 */
export const LocationDataSchema = z.object({
  /** Latitude in degrees. */
  latitude: z.number(),

  /** Longitude in degrees. */
  longitude: z.number(),

  /**
   * Altitude above sea level in meters.
   * `null` if altitude data is not available on the device.
   */
  altitude: z.number().nullable(),

  /**
   * The direction the device is moving in degrees, measured clockwise from
   * north. `null` if course data is not available on the device.
   */
  course: z.number().nullable(),

  /**
   * The speed of the device in m/s.
   * `null` if speed data is not available on the device.
   */
  speed: z.number().nullable(),

  /**
   * Accuracy of the latitude and longitude values in meters.
   * `null` if horizontal accuracy data is not available on the device.
   */
  horizontal_accuracy: z.number().nullable(),

  /**
   * Accuracy of the altitude value in meters.
   * `null` if vertical accuracy data is not available on the device.
   */
  vertical_accuracy: z.number().nullable(),

  /**
   * Accuracy of the course value in degrees.
   * `null` if course accuracy data is not available on the device.
   */
  course_accuracy: z.number().nullable(),

  /**
   * Accuracy of the speed value in m/s.
   * `null` if speed accuracy data is not available on the device.
   */
  speed_accuracy: z.number().nullable(),
});
export type LocationData = z.infer<typeof LocationDataSchema>;