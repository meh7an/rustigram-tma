import { z } from "zod";

/**
 * Describes a button in a native popup opened by `WebApp.showPopup()`.
 *
 * @see https://core.telegram.org/bots/webapps#popupbutton
 */
export const PopupButtonSchema = z.object({
  /**
   * Identifier of the button, 0–64 characters. Defaults to an empty
   * string. Returned in the `popupClosed` event and the `showPopup`
   * callback when this button is pressed.
   */
  id: z.string().max(64).optional(),

  /**
   * Type of the button. Defaults to `"default"`.
   * - `"default"` — a button with the default style.
   * - `"ok"` — a button with the localized text "OK".
   * - `"close"` — a button with the localized text "Close".
   * - `"cancel"` — a button with the localized text "Cancel".
   * - `"destructive"` — a button with a style that indicates a destructive action.
   */
  type: z.enum(["default", "ok", "close", "cancel", "destructive"]).optional(),

  /**
   * The text to be displayed on the button, 0–64 characters. Required for
   * `"default"` and `"destructive"` types — validated at runtime by
   * Telegram, not enforced here to avoid over-constraining the schema.
   */
  text: z.string().max(64).optional(),
});
export type PopupButton = z.infer<typeof PopupButtonSchema>;

/**
 * Describes the native popup opened by `WebApp.showPopup()`.
 *
 * @since Bot API 6.2
 * @see https://core.telegram.org/bots/webapps#popupparams
 */
export const PopupParamsSchema = z.object({
  /** The text to be displayed in the popup title, 0–64 characters. */
  title: z.string().max(64).optional(),

  /** The message to be displayed in the popup body, 1–256 characters. */
  message: z.string().min(1).max(256),

  /**
   * A list of buttons to be displayed in the popup, 1–3 buttons.
   * Defaults to `[{ type: "close" }]`.
   */
  buttons: z.array(PopupButtonSchema).min(1).max(3).optional(),
});
export type PopupParams = z.infer<typeof PopupParamsSchema>;

/**
 * Describes the native QR code scanner popup opened by
 * `WebApp.showScanQrPopup()`.
 *
 * @since Bot API 6.4
 * @see https://core.telegram.org/bots/webapps#scanqrpopupparams
 */
export const ScanQrPopupParamsSchema = z.object({
  /**
   * The text to be displayed under the QR code scanner, 0–64 characters.
   */
  text: z.string().max(64).optional(),
});
export type ScanQrPopupParams = z.infer<typeof ScanQrPopupParamsSchema>;

/**
 * Describes a widget link to be included in a story share.
 *
 * @since Bot API 7.8
 * @see https://core.telegram.org/bots/webapps#storywidgetlink
 */
export const StoryWidgetLinkSchema = z.object({
  /** The URL to be included in the story widget. */
  url: z.string().url(),

  /** The name to be displayed for the widget link, 0–48 characters. */
  name: z.string().max(48).optional(),
});
export type StoryWidgetLink = z.infer<typeof StoryWidgetLinkSchema>;

/**
 * Describes additional sharing settings for the native story editor
 * opened by `WebApp.shareToStory()`.
 *
 * @since Bot API 7.8
 * @see https://core.telegram.org/bots/webapps#storyshareparams
 */
export const StoryShareParamsSchema = z.object({
  /**
   * A caption to be added to the media, 0–2048 characters for regular
   * users and 0–2048 characters for Premium subscribers.
   */
  text: z.string().max(2048).optional(),

  /** An object describing a widget link to be included in the story. */
  widget_link: StoryWidgetLinkSchema.optional(),
});
export type StoryShareParams = z.infer<typeof StoryShareParamsSchema>;

/**
 * Describes additional settings for setting an emoji status via
 * `WebApp.setEmojiStatus()`.
 *
 * @since Bot API 8.0
 * @see https://core.telegram.org/bots/webapps#emojistatusparams
 */
export const EmojiStatusParamsSchema = z.object({
  /**
   * The duration in seconds for which the status will remain set.
   * When omitted, the status is set indefinitely.
   */
  duration: z.number().int().positive().optional(),
});
export type EmojiStatusParams = z.infer<typeof EmojiStatusParamsSchema>;

/**
 * Describes the parameters for a file download request shown via
 * `WebApp.downloadFile()`.
 *
 * Note: to ensure consistent download behavior across platforms, the
 * server response should include the HTTP headers
 * `Content-Disposition: attachment; filename="<file_name>"` and
 * `Access-Control-Allow-Origin: https://web.telegram.org`. Without
 * these headers, the download may not work as expected on web platforms.
 *
 * @since Bot API 8.0
 * @see https://core.telegram.org/bots/webapps#downloadfileparams
 */
export const DownloadFileParamsSchema = z.object({
  /** The HTTPS URL of the file to be downloaded. */
  url: z.string().url(),

  /** The suggested name for the downloaded file, 1+ characters. */
  file_name: z.string().min(1),
});
export type DownloadFileParams = z.infer<typeof DownloadFileParamsSchema>;