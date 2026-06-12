import { z } from "zod";

/**
 * Contains data about the Mini App user.
 *
 * @see https://core.telegram.org/bots/webapps#webappuser
 */
export const WebAppUserSchema = z.object({
  /**
   * A unique identifier for the user or bot. Has at most 52 significant
   * bits, so a 64-bit integer type is safe for storing this value.
   */
  id: z.number().int(),

  /**
   * `true` if this user is a bot. Returned only in the `receiver` field —
   * never present on the initiating user.
   */
  is_bot: z.boolean().optional(),

  /** First name of the user or bot. */
  first_name: z.string(),

  /** Last name of the user or bot. */
  last_name: z.string().optional(),

  /** Username of the user or bot. */
  username: z.string().optional(),

  /**
   * IETF language tag of the user's language. Returned only in the `user`
   * field.
   */
  language_code: z.string().optional(),

  /**
   * `true` if this user is a Telegram Premium user. Omitted entirely when
   * `false` — Telegram never sends the field with a false value.
   */
  is_premium: z.literal(true).optional(),

  /**
   * `true` if this user has added the bot to the attachment menu. Omitted
   * entirely when `false`.
   * @since Bot API 6.3
   */
  added_to_attachment_menu: z.literal(true).optional(),

  /**
   * `true` if this user has allowed the bot to message them. Omitted
   * entirely when `false`.
   * @since Bot API 6.3
   */
  allows_write_to_pm: z.literal(true).optional(),

  /**
   * URL of the user's profile photo. Available to all Mini Apps when the
   * user's privacy settings permit it.
   * @since Bot API 7.5
   */
  photo_url: z.string().url().optional(),
});
export type WebAppUser = z.infer<typeof WebAppUserSchema>;

/**
 * Represents a chat in which the Mini App was launched via the attachment
 * menu.
 *
 * @see https://core.telegram.org/bots/webapps#webappchat
 */
export const WebAppChatSchema = z.object({
  /**
   * Unique identifier for the chat. Has at most 52 significant bits, so a
   * 64-bit integer type is safe for storing this value.
   */
  id: z.number().int(),

  /** Type of the chat. */
  type: z.enum(["group", "supergroup", "channel"]),

  /** Title of the chat. */
  title: z.string(),

  /** Username of the chat. */
  username: z.string().optional(),

  /** URL of the chat's photo. */
  photo_url: z.string().url().optional(),
});
export type WebAppChat = z.infer<typeof WebAppChatSchema>;

/**
 * Contains data transferred to the Mini App when it is opened. Empty if
 * launched from a keyboard button or from inline mode.
 *
 * WARNING: Data from this object must not be trusted on the client.
 * Only use `initData` on the bot's server after it has been validated
 * against the bot token (HMAC-SHA256) or via Ed25519 for third-party use.
 *
 * @see https://core.telegram.org/bots/webapps#webappinitdata
 */
export const WebAppInitDataSchema = z.object({
  /**
   * A unique identifier for the Mini App session, required for sending
   * messages via the `answerWebAppQuery` Bot API method.
   */
  query_id: z.string().optional(),

  /** An object containing data about the current user. */
  user: WebAppUserSchema.optional(),

  /**
   * An object containing data about the chat partner of the current user
   * in the chat where the bot was launched via the attachment menu.
   * Returned only for private chats and only for Mini Apps launched via
   * the attachment menu.
   */
  receiver: WebAppUserSchema.optional(),

  /**
   * An object containing data about the chat where the bot was launched
   * via the attachment menu. Returned for supergroups, channels, and group
   * chats — only for Mini Apps launched via the attachment menu.
   */
  chat: WebAppChatSchema.optional(),

  /**
   * Type of the chat from which the Mini App was opened. Returned only for
   * direct link Mini Apps and groups, supergroups, and channels.
   */
  chat_type: z.enum(["sender", "private", "group", "supergroup", "channel"]).optional(),

  /**
   * Global identifier indicating the chat from which the Mini App was
   * opened. Returned only for direct link Mini Apps and groups,
   * supergroups, and channels.
   */
  chat_instance: z.string().optional(),

  /**
   * The value of the `startattach` or `startapp` parameter passed in the
   * link used to launch the Mini App.
   */
  start_param: z.string().optional(),

  /**
   * Time in seconds, after which a message can be sent via the
   * `answerWebAppQuery` method.
   */
  can_send_after: z.number().int().optional(),

  /** Unix timestamp of when the form was opened. Used to prevent replay attacks. */
  auth_date: z.number().int(),

  /**
   * An HMAC-SHA-256 hash of the `data-check-string` used to validate the
   * data against the bot token.
   */
  hash: z.string(),

  /**
   * An Ed25519 signature of the `data-check-string` for third-party
   * validation without requiring the bot token.
   * @since Bot API 8.0
   */
  signature: z.string().optional(),
});
export type WebAppInitData = z.infer<typeof WebAppInitDataSchema>;