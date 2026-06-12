import { z } from "zod";

const insetShape = {
  /** Top inset in pixels. */
  top: z.number().int().nonnegative(),
  /** Bottom inset in pixels. */
  bottom: z.number().int().nonnegative(),
  /** Left inset in pixels. */
  left: z.number().int().nonnegative(),
  /** Right inset in pixels. */
  right: z.number().int().nonnegative(),
};

/**
 * Represents the system-defined safe area insets, providing padding values
 * to ensure content remains within visible boundaries, avoiding overlap with
 * system UI elements like notches or navigation bars.
 *
 * Updated via the `safeAreaChanged` event.
 *
 * @since Bot API 8.0
 * @see https://core.telegram.org/bots/webapps#safeareainset
 */
export const SafeAreaInsetSchema = z.object(insetShape);
export type SafeAreaInset = z.infer<typeof SafeAreaInsetSchema>;

/**
 * Represents the content-defined safe area insets, providing padding values
 * to ensure content remains within visible boundaries, avoiding overlap with
 * Telegram UI elements (e.g. the header or bottom bar).
 *
 * Updated via the `contentSafeAreaChanged` event.
 *
 * @since Bot API 8.0
 * @see https://core.telegram.org/bots/webapps#contentsafeareainset
 */
export const ContentSafeAreaInsetSchema = z.object(insetShape);
export type ContentSafeAreaInset = z.infer<typeof ContentSafeAreaInsetSchema>;