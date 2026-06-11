import { z } from "zod";

// All theme color fields are optional — older clients omit fields
// they don't support, so nothing here can be treated as guaranteed.
const hexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Expected hex color in #RRGGBB format");

export const ColorSchemeSchema = z.enum(["light", "dark"]);
export type ColorScheme = z.infer<typeof ColorSchemeSchema>;

export const ThemeParamsSchema = z.object({
  bg_color: hexColorSchema.optional(),
  text_color: hexColorSchema.optional(),
  hint_color: hexColorSchema.optional(),
  link_color: hexColorSchema.optional(),
  button_color: hexColorSchema.optional(),
  button_text_color: hexColorSchema.optional(),
  secondary_bg_color: hexColorSchema.optional(),
  header_bg_color: hexColorSchema.optional(),
  bottom_bar_bg_color: hexColorSchema.optional(),
  accent_text_color: hexColorSchema.optional(),
  section_bg_color: hexColorSchema.optional(),
  section_header_text_color: hexColorSchema.optional(),
  section_separator_color: hexColorSchema.optional(),
  subtitle_text_color: hexColorSchema.optional(),
  destructive_text_color: hexColorSchema.optional(),
});
export type ThemeParams = z.infer<typeof ThemeParamsSchema>;
