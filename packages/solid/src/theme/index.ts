import { createMemo } from "solid-js";
import type { Accessor, JSX } from "solid-js";
import { useColorScheme, useThemeParams, useSafeAreaInset } from "../signals/index";

/**
 * Return value of `useTmaTheme()`.
 */
export interface TmaTheme {
  /** Reactive signal for the current color scheme (`"light"` or `"dark"`). */
  colorScheme: Accessor<"light" | "dark">;
  /** Reactive signal for the current `ThemeParams`. */
  themeParams: ReturnType<typeof useThemeParams>;
  /** Derived reactive signal — `true` when `colorScheme` is `"dark"`. */
  isDark: Accessor<boolean>;
}

/**
 * Solid hook that bundles the most commonly needed theme signals together.
 *
 * Returns `colorScheme`, `themeParams`, and a convenient `isDark` derived
 * signal. All values update reactively when Telegram fires `themeChanged`.
 *
 * Must be called inside a component tree wrapped by `<TmaProvider>`.
 *
 * @example
 * const { isDark, themeParams } = useTmaTheme();
 * return (
 *   <div style={{ background: themeParams().bg_color }}>
 *     {isDark() ? "Dark mode" : "Light mode"}
 *   </div>
 * );
 */
export function useTmaTheme(): TmaTheme {
  const colorScheme = useColorScheme();
  const themeParams = useThemeParams();
  const isDark = createMemo(() => colorScheme() === "dark");
  return { colorScheme, themeParams, isDark };
}

/**
 * Returns a reactive `style` object padded by the device safe area insets.
 *
 * Use on a fullscreen wrapper element to prevent content from being obscured
 * by system UI elements such as the notch, status bar, or navigation bar.
 * Updates reactively when `safeAreaChanged` fires.
 *
 * Must be called inside a component tree wrapped by `<TmaProvider>`.
 *
 * @since Bot API 8.0
 *
 * @example
 * const safeStyle = useSafeAreaStyle();
 * return <div style={safeStyle()}>content</div>;
 */
export function useSafeAreaStyle(): Accessor<JSX.CSSProperties> {
  const safeArea = useSafeAreaInset();
  return createMemo(() => ({
    paddingTop: `${safeArea().top}px`,
    paddingBottom: `${safeArea().bottom}px`,
    paddingLeft: `${safeArea().left}px`,
    paddingRight: `${safeArea().right}px`,
  }));
}