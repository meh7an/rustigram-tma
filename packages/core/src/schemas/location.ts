import { z } from "zod";

export const LocationDataSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  // These four are null when the device cannot determine the value.
  altitude: z.number().nullable(),
  course: z.number().nullable(),
  speed: z.number().nullable(),
  horizontal_accuracy: z.number().nullable(),
  vertical_accuracy: z.number().nullable(),
  course_accuracy: z.number().nullable(),
  speed_accuracy: z.number().nullable(),
});
export type LocationData = z.infer<typeof LocationDataSchema>;
