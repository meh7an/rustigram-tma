import { z } from "zod";

// All theme color fields are optional — older clients omit fields
// they don't support, so nothing here can be treated as guaranteed.
const hexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Expected hex color in #RRGGBB format");

/** @see https://core.telegram.org/bots/webapps#colorscheme */
export const ColorSchemeSchema = z.enum(["light", "dark"]);
export type ColorScheme = z.infer<typeof ColorSchemeSchema>;

/**
 * Contains the user's current theme settings used in the Telegram app.
 * Mini Apps can adjust the appearance of the interface to match the
 * Telegram user's app in real time.
 *
 * All fields are optional — older clients omit fields they don't support.
 * Never treat any field as guaranteed to be present.
 *
 * @see https://core.telegram.org/bots/webapps#themeparams
 */
export const ThemeParamsSchema = z.object({
  /** Background color in the `#RRGGBB` format. CSS: `var(--tg-theme-bg-color)`. */
  bg_color: hexColorSchema.optional(),

  /** Main text color in the `#RRGGBB` format. CSS: `var(--tg-theme-text-color)`. */
  text_color: hexColorSchema.optional(),

  /** Hint text color in the `#RRGGBB` format. CSS: `var(--tg-theme-hint-color)`. */
  hint_color: hexColorSchema.optional(),

  /** Link color in the `#RRGGBB` format. CSS: `var(--tg-theme-link-color)`. */
  link_color: hexColorSchema.optional(),

  /** Button color in the `#RRGGBB` format. CSS: `var(--tg-theme-button-color)`. */
  button_color: hexColorSchema.optional(),

  /** Button text color in the `#RRGGBB` format. CSS: `var(--tg-theme-button-text-color)`. */
  button_text_color: hexColorSchema.optional(),

  /**
   * Secondary background color in the `#RRGGBB` format.
   * CSS: `var(--tg-theme-secondary-bg-color)`.
   * @since Bot API 6.1
   */
  secondary_bg_color: hexColorSchema.optional(),

  /**
   * Header background color in the `#RRGGBB` format.
   * CSS: `var(--tg-theme-header-bg-color)`.
   * @since Bot API 7.0
   */
  header_bg_color: hexColorSchema.optional(),

  /**
   * Bottom bar background color in the `#RRGGBB` format.
   * CSS: `var(--tg-theme-bottom-bar-bg-color)`.
   * Also applied to the navigation bar on Android.
   * @since Bot API 7.10
   */
  bottom_bar_bg_color: hexColorSchema.optional(),

  /**
   * Accent text color in the `#RRGGBB` format.
   * CSS: `var(--tg-theme-accent-text-color)`.
   * @since Bot API 7.0
   */
  accent_text_color: hexColorSchema.optional(),

  /**
   * Background color for sections in the `#RRGGBB` format.
   * Recommended to use in conjunction with `secondary_bg_color`.
   * CSS: `var(--tg-theme-section-bg-color)`.
   * @since Bot API 7.0
   */
  section_bg_color: hexColorSchema.optional(),

  /**
   * Section header text color in the `#RRGGBB` format.
   * CSS: `var(--tg-theme-section-header-text-color)`.
   * @since Bot API 7.0
   */
  section_header_text_color: hexColorSchema.optional(),

  /**
   * Section separator color in the `#RRGGBB` format.
   * CSS: `var(--tg-theme-section-separator-color)`.
   * @since Bot API 7.6
   */
  section_separator_color: hexColorSchema.optional(),

  /**
   * Subtitle text color in the `#RRGGBB` format.
   * CSS: `var(--tg-theme-subtitle-text-color)`.
   * @since Bot API 7.0
   */
  subtitle_text_color: hexColorSchema.optional(),

  /**
   * Destructive action text color in the `#RRGGBB` format.
   * CSS: `var(--tg-theme-destructive-text-color)`.
   * @since Bot API 7.0
   */
  destructive_text_color: hexColorSchema.optional(),
});
export type ThemeParams = z.infer<typeof ThemeParamsSchema>;