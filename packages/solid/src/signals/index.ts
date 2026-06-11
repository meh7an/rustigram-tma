import { createSignal, onCleanup, createMemo } from "solid-js";
import type { Accessor } from "solid-js";
import type { WebAppState } from "@rustigram/tma-core";
import { useTma } from "../provider/use-tma";

type StateKey = keyof WebAppState;

// ─── Generic factory ─────────────────────────────────────────────────────────

/**
 * Creates a reactive signal for a single AppState field, subscribing on
 * creation and automatically unsubscribing when the owning component unmounts.
 * Must be called inside a component or reactive root.
 */
function useAppStateValue<K extends StateKey>(key: K): Accessor<WebAppState[K]> {
  const { appState } = useTma();
  const [value, setValue] = createSignal<WebAppState[K]>(appState.getValue(key));

  const unsubscribe = appState.subscribe(key, (v) => setValue(() => v as Exclude<WebAppState[K], Function>));
  onCleanup(unsubscribe);

  return value;
}

// ─── Named signal exports ─────────────────────────────────────────────────────

export const useColorScheme = (): Accessor<WebAppState["colorScheme"]> =>
  useAppStateValue("colorScheme");

export const useThemeParams = (): Accessor<WebAppState["themeParams"]> =>
  useAppStateValue("themeParams");

export const useIsActive = (): Accessor<boolean> =>
  useAppStateValue("isActive");

export const useIsExpanded = (): Accessor<boolean> =>
  useAppStateValue("isExpanded");

export const useIsFullscreen = (): Accessor<boolean> =>
  useAppStateValue("isFullscreen");

export const useIsOrientationLocked = (): Accessor<boolean> =>
  useAppStateValue("isOrientationLocked");

export const useIsClosingConfirmationEnabled = (): Accessor<boolean> =>
  useAppStateValue("isClosingConfirmationEnabled");

export const useIsVerticalSwipesEnabled = (): Accessor<boolean> =>
  useAppStateValue("isVerticalSwipesEnabled");

export const useViewportHeight = (): Accessor<number> =>
  useAppStateValue("viewportHeight");

export const useViewportStableHeight = (): Accessor<number> =>
  useAppStateValue("viewportStableHeight");

export const useHeaderColor = (): Accessor<string> =>
  useAppStateValue("headerColor");

export const useBackgroundColor = (): Accessor<string> =>
  useAppStateValue("backgroundColor");

export const useBottomBarColor = (): Accessor<string> =>
  useAppStateValue("bottomBarColor");

export const useSafeAreaInset = (): Accessor<WebAppState["safeAreaInset"]> =>
  useAppStateValue("safeAreaInset");

export const useContentSafeAreaInset = (): Accessor<WebAppState["contentSafeAreaInset"]> =>
  useAppStateValue("contentSafeAreaInset");

export function useIsVersionAtLeast(version: string): Accessor<boolean> {
  const { bridge } = useTma();
  // Version never changes at runtime — memo is always stable.
  return createMemo(() => bridge.isVersionAtLeast(version));
}

export function useInitData(): Accessor<WebAppState["colorScheme"]> {
  // initDataUnsafe is a launch-time snapshot — expose via bridge directly.
  const { bridge } = useTma();
  return () => bridge.launchContext.initDataUnsafe as unknown as WebAppState["colorScheme"];
}
