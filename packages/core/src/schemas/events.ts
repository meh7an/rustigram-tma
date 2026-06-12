import { z } from "zod";

import { LocationDataSchema } from "./location";

/**
 * Maps every TMA event name to its payload schema.
 *
 * `z.undefined()` means the event carries no data — the handler receives
 * no parameters. This map is the single source of truth for the bridge's
 * `onEvent`/`offEvent` types.
 *
 * @see https://core.telegram.org/bots/webapps#events-available-for-mini-apps
 */
export const TmaEventPayloadSchemas = {
  /**
   * Occurs when the Mini App becomes active (e.g. opened or returned to
   * after being in the background).
   */
  activated: z.undefined(),

  /**
   * Occurs when the Mini App becomes inactive (e.g. minimized or moved to
   * the background).
   */
  deactivated: z.undefined(),

  /**
   * Occurs whenever theme settings are changed in the user's Telegram app,
   * including switching to night mode. New settings are available via
   * `WebApp.themeParams` and `WebApp.colorScheme`.
   */
  themeChanged: z.undefined(),

  /**
   * Occurs when the visible section of the Mini App changes. The payload
   * field `isStateStable` is `true` when resizing is finished, and `false`
   * while it is in progress (user expanding/collapsing, or animation
   * playing). Current height is available via `WebApp.viewportHeight`.
   */
  viewportChanged: z.object({ isStateStable: z.boolean() }),

  /**
   * Occurs when the device's safe area insets change (e.g. due to
   * orientation change or screen adjustments). Current values are
   * available via `WebApp.safeAreaInset`.
   * @since Bot API 8.0
   */
  safeAreaChanged: z.undefined(),

  /**
   * Occurs when the safe area for content changes (e.g. due to
   * orientation change or screen adjustments). Current values are
   * available via `WebApp.contentSafeAreaInset`.
   * @since Bot API 8.0
   */
  contentSafeAreaChanged: z.undefined(),

  /**
   * Occurs when the main button is pressed. Handler receives no
   * parameters.
   */
  mainButtonClicked: z.undefined(),

  /**
   * Occurs when the secondary button is pressed. Handler receives no
   * parameters.
   */
  secondaryButtonClicked: z.undefined(),

  /**
   * Occurs when the back button is pressed. Handler receives no
   * parameters.
   * @since Bot API 6.1
   */
  backButtonClicked: z.undefined(),

  /**
   * Occurs when the settings button is pressed. Handler receives no
   * parameters.
   * @since Bot API 6.1
   */
  settingsButtonClicked: z.undefined(),

  /**
   * Occurs when an opened invoice is closed.
   * - `paid` — invoice was paid successfully.
   * - `cancelled` — user closed without paying.
   * - `failed` — user attempted payment but it failed.
   * - `pending` — payment is still being processed.
   * @since Bot API 6.1
   */
  invoiceClosed: z.object({
    url: z.string(),
    status: z.enum(["paid", "cancelled", "failed", "pending"]),
  }),

  /**
   * Occurs when an opened popup is closed. `button_id` is the `id` of the
   * pressed button, or `null` if the user closed the popup without pressing
   * any button.
   * @since Bot API 6.2
   */
  popupClosed: z.object({
    button_id: z.string().nullable(),
  }),

  /**
   * Occurs every time the QR code scanner catches a code with text data.
   * @since Bot API 6.4
   */
  qrTextReceived: z.object({ data: z.string() }),

  /**
   * Occurs when the QR code scanner popup is closed by the user.
   * @since Bot API 7.7
   */
  scanQrPopupClosed: z.undefined(),

  /**
   * Occurs when `readTextFromClipboard()` is called. `data` is the text
   * from the clipboard, or `null` if the app has no clipboard read access.
   */
  clipboardTextReceived: z.object({
    data: z.string().nullable(),
  }),

  /**
   * Occurs when write access was requested via `requestWriteAccess()`.
   * - `allowed` — user granted write access.
   * - `cancelled` — user declined the request.
   * @since Bot API 6.3
   */
  writeAccessRequested: z.object({
    status: z.enum(["allowed", "cancelled"]),
  }),

  /**
   * Occurs when a phone number was requested via `requestContact()`.
   * - `sent` — user shared their contact.
   * - `cancelled` — user declined the request.
   * @since Bot API 6.3
   */
  contactRequested: z.object({
    status: z.enum(["sent", "cancelled"]),
  }),

  /**
   * Occurs whenever the `BiometricManager` object is changed. Handler
   * receives no parameters.
   * @since Bot API 7.2
   */
  biometricManagerUpdated: z.undefined(),

  /**
   * Occurs whenever biometric authentication was requested. `isAuthenticated`
   * indicates success. If `true`, `biometricToken` contains the token stored
   * in secure storage on the device.
   * @since Bot API 7.2
   */
  biometricAuthRequested: z.object({
    isAuthenticated: z.boolean(),
    biometricToken: z.string().optional(),
  }),

  /**
   * Occurs whenever the biometric token was updated. `isUpdated` indicates
   * whether the update succeeded.
   * @since Bot API 7.2
   */
  biometricTokenUpdated: z.object({ isUpdated: z.boolean() }),

  /**
   * Occurs when the Mini App enters fullscreen mode.
   * @since Bot API 8.0
   */
  fullscreenChanged: z.undefined(),

  /**
   * Occurs when a request to enter fullscreen mode fails.
   * - `UNSUPPORTED` — fullscreen is not supported on this platform.
   * - `ALREADY_FULLSCREEN` — the Mini App is already in fullscreen mode.
   * @since Bot API 8.0
   */
  fullscreenFailed: z.object({
    error: z.enum(["UNSUPPORTED", "ALREADY_FULLSCREEN"]),
  }),

  /**
   * Occurs when the Mini App is added to the home screen.
   * @since Bot API 8.0
   */
  homeScreenAdded: z.undefined(),

  /**
   * Occurs when the home screen status was checked.
   * - `unsupported` — the feature is not supported on this platform.
   * - `unknown` — it is not known whether the app is on the home screen.
   * - `added` — the app is on the home screen.
   * - `missed` — the app is not on the home screen.
   * @since Bot API 8.0
   */
  homeScreenChecked: z.object({
    status: z.enum(["unsupported", "unknown", "added", "missed"]),
  }),

  /**
   * Occurs when accelerometer tracking starts successfully.
   * @since Bot API 8.0
   */
  accelerometerStarted: z.undefined(),

  /**
   * Occurs when accelerometer tracking stops.
   * @since Bot API 8.0
   */
  accelerometerStopped: z.undefined(),

  /**
   * Occurs at the requested frequency after `Accelerometer.start()` is
   * called. Current values are available via `Accelerometer.x/y/z`.
   * @since Bot API 8.0
   */
  accelerometerChanged: z.undefined(),

  /**
   * Occurs when a request to start accelerometer tracking fails.
   * - `UNSUPPORTED` — accelerometer is not supported on this device or platform.
   * @since Bot API 8.0
   */
  accelerometerFailed: z.object({ error: z.literal("UNSUPPORTED") }),

  /**
   * Occurs when device orientation tracking starts successfully.
   * @since Bot API 8.0
   */
  deviceOrientationStarted: z.undefined(),

  /**
   * Occurs when device orientation tracking stops.
   * @since Bot API 8.0
   */
  deviceOrientationStopped: z.undefined(),

  /**
   * Occurs at the requested frequency after `DeviceOrientation.start()` is
   * called. Current values are available via `DeviceOrientation.alpha/beta/gamma`.
   * @since Bot API 8.0
   */
  deviceOrientationChanged: z.undefined(),

  /**
   * Occurs when a request to start device orientation tracking fails.
   * - `UNSUPPORTED` — device orientation is not supported on this device or platform.
   * @since Bot API 8.0
   */
  deviceOrientationFailed: z.object({ error: z.literal("UNSUPPORTED") }),

  /**
   * Occurs when gyroscope tracking starts successfully.
   * @since Bot API 8.0
   */
  gyroscopeStarted: z.undefined(),

  /**
   * Occurs when gyroscope tracking stops.
   * @since Bot API 8.0
   */
  gyroscopeStopped: z.undefined(),

  /**
   * Occurs at the requested frequency after `Gyroscope.start()` is called.
   * Current rotation rates are available via `Gyroscope.x/y/z`.
   * @since Bot API 8.0
   */
  gyroscopeChanged: z.undefined(),

  /**
   * Occurs when a request to start gyroscope tracking fails.
   * - `UNSUPPORTED` — gyroscope is not supported on this device or platform.
   * @since Bot API 8.0
   */
  gyroscopeFailed: z.object({ error: z.literal("UNSUPPORTED") }),

  /**
   * Occurs whenever the `LocationManager` object is changed. Handler
   * receives no parameters.
   * @since Bot API 8.0
   */
  locationManagerUpdated: z.undefined(),

  /**
   * Occurs when a location request completes. The payload contains the
   * location data returned by the device.
   * @since Bot API 8.0
   */
  locationRequested: z.object({ locationData: LocationDataSchema }),

  /**
   * Occurs when a message is successfully shared via `shareMessage()`.
   * @since Bot API 8.0
   */
  shareMessageSent: z.undefined(),

  /**
   * Occurs when sharing a message via `shareMessage()` fails.
   * - `UNSUPPORTED` — the feature is not supported by the client.
   * - `MESSAGE_EXPIRED` — the message has expired.
   * - `MESSAGE_SEND_FAILED` — the message could not be sent.
   * - `USER_DECLINED` — the user closed the dialog without sharing.
   * - `UNKNOWN_ERROR` — an unknown error occurred.
   * @since Bot API 8.0
   */
  shareMessageFailed: z.object({
    error: z.enum([
      "UNSUPPORTED",
      "MESSAGE_EXPIRED",
      "MESSAGE_SEND_FAILED",
      "USER_DECLINED",
      "UNKNOWN_ERROR",
    ]),
  }),

  /**
   * Occurs when the emoji status is successfully set via `setEmojiStatus()`.
   * @since Bot API 8.0
   */
  emojiStatusSet: z.undefined(),

  /**
   * Occurs when setting the emoji status fails.
   * - `UNSUPPORTED` — the feature is not supported by the client.
   * - `SUGGESTED_EMOJI_INVALID` — one or more emoji identifiers are invalid.
   * - `DURATION_INVALID` — the specified duration is invalid.
   * - `USER_DECLINED` — the user closed the dialog without setting a status.
   * - `SERVER_ERROR` — a server error occurred.
   * - `UNKNOWN_ERROR` — an unknown error occurred.
   * @since Bot API 8.0
   */
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

  /**
   * Occurs when emoji status write permission was requested via
   * `requestEmojiStatusAccess()`.
   * - `allowed` — user granted permission.
   * - `cancelled` — user declined the request.
   * @since Bot API 8.0
   */
  emojiStatusAccessRequested: z.object({
    status: z.enum(["allowed", "cancelled"]),
  }),

  /**
   * Occurs when the native file download popup is closed. `status` is
   * either `"downloading"` (user accepted) or `"cancelled"` (user
   * declined).
   * @since Bot API 8.0
   */
  fileDownloadRequested: z.object({
    status: z.enum(["downloading", "cancelled"]),
  }),
} as const satisfies Record<string, z.ZodTypeAny>;

/** Union of all valid TMA event names. */
export type TmaEventType = keyof typeof TmaEventPayloadSchemas;

/** The payload type for a given TMA event. */
export type TmaEventPayload<T extends TmaEventType> = z.infer<(typeof TmaEventPayloadSchemas)[T]>;