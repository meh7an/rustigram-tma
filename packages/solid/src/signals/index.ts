import { createSignal, onCleanup, createMemo } from "solid-js";
import type { Accessor } from "solid-js";
import type { WebAppState, WebAppInitData } from "@rustigram/tma-core";
import { useTma } from "../provider/use-tma";

type StateKey = keyof WebAppState;

// ─── Generic factory ─────────────────────────────────────────────────────────

/**
 * Creates a reactive Solid signal for a single `AppState` field.
 *
 * Subscribes to the field on creation and automatically unsubscribes when
 * the owning component unmounts via `onCleanup`. Must be called inside a
 * component or reactive root that is a descendant of `<TmaProvider>`.
 */
function useAppStateValue<K extends StateKey>(key: K): Accessor<WebAppState[K]> {
  const { appState } = useTma();
  const [value, setValue] = createSignal<WebAppState[K]>(appState.getValue(key));

  const unsubscribe = appState.subscribe(key, (v) => setValue(() => v as Exclude<WebAppState[K], undefined>));
  onCleanup(unsubscribe);

  return value;
}

// ─── Named signal exports ─────────────────────────────────────────────────────

/** Reactive signal for the current Telegram color scheme (`"light"` or `"dark"`). Updated on `themeChanged`. */
export const useColorScheme = (): Accessor<WebAppState["colorScheme"]> =>
  useAppStateValue("colorScheme");

/** Reactive signal for the current `ThemeParams`. Updated on `themeChanged`. */
export const useThemeParams = (): Accessor<WebAppState["themeParams"]> =>
  useAppStateValue("themeParams");

/** Reactive signal for `isActive` — `true` when the Mini App is in the foreground. Updated on `activated`/`deactivated`. */
export const useIsActive = (): Accessor<boolean> =>
  useAppStateValue("isActive");

/** Reactive signal for `isExpanded` — `true` when the Mini App is at maximum height. Updated on `viewportChanged`. */
export const useIsExpanded = (): Accessor<boolean> =>
  useAppStateValue("isExpanded");

/**
 * Reactive signal for `isFullscreen`. Updated on `fullscreenChanged`.
 * @since Bot API 8.0
 */
export const useIsFullscreen = (): Accessor<boolean> =>
  useAppStateValue("isFullscreen");

/**
 * Reactive signal for `isOrientationLocked`. Updated on `fullscreenChanged`.
 * @since Bot API 8.0
 */
export const useIsOrientationLocked = (): Accessor<boolean> =>
  useAppStateValue("isOrientationLocked");

/** Reactive signal for `isClosingConfirmationEnabled`. */
export const useIsClosingConfirmationEnabled = (): Accessor<boolean> =>
  useAppStateValue("isClosingConfirmationEnabled");

/** Reactive signal for `isVerticalSwipesEnabled`. */
export const useIsVerticalSwipesEnabled = (): Accessor<boolean> =>
  useAppStateValue("isVerticalSwipesEnabled");

/** Reactive signal for the current visible viewport height in pixels. Updated on `viewportChanged`. */
export const useViewportHeight = (): Accessor<number> =>
  useAppStateValue("viewportHeight");

/**
 * Reactive signal for the stable viewport height in pixels. Only updates
 * when `viewportChanged` fires with `isStateStable: true`. Prefer this over
 * `useViewportHeight` for layout to avoid jumps during transitions.
 */
export const useViewportStableHeight = (): Accessor<number> =>
  useAppStateValue("viewportStableHeight");

/** Reactive signal for the current header color. Updated on `themeChanged`. */
export const useHeaderColor = (): Accessor<string> =>
  useAppStateValue("headerColor");

/** Reactive signal for the current background color. Updated on `themeChanged`. */
export const useBackgroundColor = (): Accessor<string> =>
  useAppStateValue("backgroundColor");

/**
 * Reactive signal for the current bottom bar color. Updated on `themeChanged`.
 * @since Bot API 7.10
 */
export const useBottomBarColor = (): Accessor<string> =>
  useAppStateValue("bottomBarColor");

/**
 * Reactive signal for the system safe area insets in pixels. Updated on
 * `safeAreaChanged`.
 * @since Bot API 8.0
 */
export const useSafeAreaInset = (): Accessor<WebAppState["safeAreaInset"]> =>
  useAppStateValue("safeAreaInset");

/**
 * Reactive signal for the Telegram UI safe area insets in pixels. Updated on
 * `contentSafeAreaChanged`.
 * @since Bot API 8.0
 */
export const useContentSafeAreaInset = (): Accessor<WebAppState["contentSafeAreaInset"]> =>
  useAppStateValue("contentSafeAreaInset");

/**
 * Returns a stable `Accessor<boolean>` that is `true` when the current Bot
 * API version is at least `version`.
 *
 * The result is a `createMemo` — the version never changes at runtime so the
 * memo always returns the same value, but it participates correctly in
 * Solid's reactive graph.
 *
 * @example
 * const hasFullscreen = useIsVersionAtLeast("8.0");
 * return <Show when={hasFullscreen()}><FullscreenButton /></Show>;
 */
export function useIsVersionAtLeast(version: string): Accessor<boolean> {
  const { bridge } = useTma();
  // Version never changes at runtime — memo is always stable.
  return createMemo(() => bridge.isVersionAtLeast(version));
}

/**
 * Returns a stable `Accessor<WebAppInitData>` wrapping the launch-time
 * `initDataUnsafe` snapshot from the bridge.
 *
 * The value never changes after mount — `initDataUnsafe` is captured once
 * at `initBridge()` time. Use `bridge.launchContext.initDataUnsafe` directly
 * if you don't need a signal.
 *
 * WARNING: never trust `initDataUnsafe` on the client. Only use it for
 * display purposes — validate the raw `initData` string server-side before
 * acting on any values.
 *
 * @example
 * const initData = useInitData();
 * return <p>Hello, {initData().user?.first_name}</p>;
 */
export function useInitData(): Accessor<WebAppInitData> {
  const { bridge } = useTma();
  return () => bridge.launchContext.initDataUnsafe;
}