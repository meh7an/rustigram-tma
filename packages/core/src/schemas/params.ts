import { z } from "zod";

export const PopupButtonSchema = z.object({
  id: z.string().max(64).optional(),
  type: z.enum(["default", "ok", "close", "cancel", "destructive"]).optional(),
  // text is required only for "default" and "destructive" — validated at runtime
  // by Telegram, not enforced here to avoid over-constraining the schema.
  text: z.string().max(64).optional(),
});
export type PopupButton = z.infer<typeof PopupButtonSchema>;

export const PopupParamsSchema = z.object({
  title: z.string().max(64).optional(),
  message: z.string().min(1).max(256),
  buttons: z.array(PopupButtonSchema).min(1).max(3).optional(),
});
export type PopupParams = z.infer<typeof PopupParamsSchema>;

export const ScanQrPopupParamsSchema = z.object({
  text: z.string().max(64).optional(),
});
export type ScanQrPopupParams = z.infer<typeof ScanQrPopupParamsSchema>;

export const StoryWidgetLinkSchema = z.object({
  url: z.string().url(),
  name: z.string().max(48).optional(),
});
export type StoryWidgetLink = z.infer<typeof StoryWidgetLinkSchema>;

export const StoryShareParamsSchema = z.object({
  // Premium subscribers get 0-2048 chars; we cap at 2048 to accommodate both.
  text: z.string().max(2048).optional(),
  widget_link: StoryWidgetLinkSchema.optional(),
});
export type StoryShareParams = z.infer<typeof StoryShareParamsSchema>;

export const EmojiStatusParamsSchema = z.object({
  duration: z.number().int().positive().optional(),
});
export type EmojiStatusParams = z.infer<typeof EmojiStatusParamsSchema>;

export const DownloadFileParamsSchema = z.object({
  url: z.string().url(),
  file_name: z.string().min(1),
});
export type DownloadFileParams = z.infer<typeof DownloadFileParamsSchema>;
