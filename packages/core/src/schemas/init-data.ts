import { z } from "zod";

export const WebAppUserSchema = z.object({
  // IDs have at most 52 significant bits — safe as JS number.
  id: z.number().int(),
  // is_bot only appears in the receiver field, never in user.
  is_bot: z.boolean().optional(),
  first_name: z.string(),
  last_name: z.string().optional(),
  username: z.string().optional(),
  language_code: z.string().optional(),
  // These three are only present when true — Telegram omits them otherwise.
  is_premium: z.literal(true).optional(),
  added_to_attachment_menu: z.literal(true).optional(),
  allows_write_to_pm: z.literal(true).optional(),
  photo_url: z.string().url().optional(),
});
export type WebAppUser = z.infer<typeof WebAppUserSchema>;

export const WebAppChatSchema = z.object({
  id: z.number().int(),
  type: z.enum(["group", "supergroup", "channel"]),
  title: z.string(),
  username: z.string().optional(),
  photo_url: z.string().url().optional(),
});
export type WebAppChat = z.infer<typeof WebAppChatSchema>;

export const WebAppInitDataSchema = z.object({
  query_id: z.string().optional(),
  user: WebAppUserSchema.optional(),
  receiver: WebAppUserSchema.optional(),
  chat: WebAppChatSchema.optional(),
  // chat_type and chat_instance are only present for direct link launches.
  chat_type: z.enum(["sender", "private", "group", "supergroup", "channel"]).optional(),
  chat_instance: z.string().optional(),
  start_param: z.string().optional(),
  can_send_after: z.number().int().optional(),
  auth_date: z.number().int(),
  hash: z.string(),
  // signature is for Ed25519 third-party validation — present from Bot API 8.0+.
  signature: z.string().optional(),
});
export type WebAppInitData = z.infer<typeof WebAppInitDataSchema>;
