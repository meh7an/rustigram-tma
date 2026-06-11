import { createMemo } from "solid-js";
import type { Accessor, JSX } from "solid-js";
import { useColorScheme, useThemeParams, useSafeAreaInset } from "../signals/index";

export interface TmaTheme {
  colorScheme: Accessor<"light" | "dark">;
  themeParams: ReturnType<typeof useThemeParams>;
  isDark: Accessor<boolean>;
}

/** Returns reactive theme values and a convenient isDark derived signal. */
export function useTmaTheme(): TmaTheme {
  const colorScheme = useColorScheme();
  const themeParams = useThemeParams();
  const isDark = createMemo(() => colorScheme() === "dark");
  return { colorScheme, themeParams, isDark };
}

/**
 * Returns a reactive `style` object padded by the device safe area insets.
 * Use on a fullscreen wrapper to avoid content sitting behind the notch
 * or navigation bar.
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
