import { z } from "zod";

import { LocationDataSchema } from "./location";

// Maps every TMA event name to its payload schema.
// z.undefined() means the event carries no data.
// This map is the single source of truth for the bridge's onEvent/offEvent types.
export const TmaEventPayloadSchemas = {
  activated: z.undefined(),
  deactivated: z.undefined(),
  themeChanged: z.undefined(),
  viewportChanged: z.object({ isStateStable: z.boolean() }),
  safeAreaChanged: z.undefined(),
  contentSafeAreaChanged: z.undefined(),
  mainButtonClicked: z.undefined(),
  secondaryButtonClicked: z.undefined(),
  backButtonClicked: z.undefined(),
  settingsButtonClicked: z.undefined(),
  invoiceClosed: z.object({
    url: z.string(),
    status: z.enum(["paid", "cancelled", "failed", "pending"]),
  }),
  popupClosed: z.object({
    button_id: z.string().nullable(),
  }),
  qrTextReceived: z.object({ data: z.string() }),
  scanQrPopupClosed: z.undefined(),
  clipboardTextReceived: z.object({
    // null means the app has no clipboard access.
    data: z.string().nullable(),
  }),
  writeAccessRequested: z.object({
    status: z.enum(["allowed", "cancelled"]),
  }),
  contactRequested: z.object({
    status: z.enum(["sent", "cancelled"]),
  }),
  biometricManagerUpdated: z.undefined(),
  biometricAuthRequested: z.object({
    isAuthenticated: z.boolean(),
    biometricToken: z.string().optional(),
  }),
  biometricTokenUpdated: z.object({ isUpdated: z.boolean() }),
  fullscreenChanged: z.undefined(),
  fullscreenFailed: z.object({
    error: z.enum(["UNSUPPORTED", "ALREADY_FULLSCREEN"]),
  }),
  homeScreenAdded: z.undefined(),
  homeScreenChecked: z.object({
    status: z.enum(["unsupported", "unknown", "added", "missed"]),
  }),
  accelerometerStarted: z.undefined(),
  accelerometerStopped: z.undefined(),
  accelerometerChanged: z.undefined(),
  accelerometerFailed: z.object({ error: z.literal("UNSUPPORTED") }),
  deviceOrientationStarted: z.undefined(),
  deviceOrientationStopped: z.undefined(),
  deviceOrientationChanged: z.undefined(),
  deviceOrientationFailed: z.object({ error: z.literal("UNSUPPORTED") }),
  gyroscopeStarted: z.undefined(),
  gyroscopeStopped: z.undefined(),
  gyroscopeChanged: z.undefined(),
  gyroscopeFailed: z.object({ error: z.literal("UNSUPPORTED") }),
  locationManagerUpdated: z.undefined(),
  locationRequested: z.object({ locationData: LocationDataSchema }),
  shareMessageSent: z.undefined(),
  shareMessageFailed: z.object({
    error: z.enum([
      "UNSUPPORTED",
      "MESSAGE_EXPIRED",
      "MESSAGE_SEND_FAILED",
      "USER_DECLINED",
      "UNKNOWN_ERROR",
    ]),
  }),
  emojiStatusSet: z.undefined(),
  emojiStatusFailed: z.object({
    error: z.enum([
      "UNSUPPORTED",
      "SUGGESTED_EMOJI_INVALID",
      "DURATION_INVALID",
      "USER_DECLINED",
      "SERVER_ERROR",
      "UNKNOWN_ERROR",
    ]),
  }),
  emojiStatusAccessRequested: z.object({
    status: z.enum(["allowed", "cancelled"]),
  }),
  fileDownloadRequested: z.object({
    status: z.enum(["downloading", "cancelled"]),
  }),
} as const satisfies Record<string, z.ZodTypeAny>;

export type TmaEventType = keyof typeof TmaEventPayloadSchemas;

export type TmaEventPayload<T extends TmaEventType> = z.infer<(typeof TmaEventPayloadSchemas)[T]>;