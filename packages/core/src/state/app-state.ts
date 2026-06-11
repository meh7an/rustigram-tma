import type { TmaBridge } from "../bridge/tma-bridge";
import type { TelegramWebApp } from "../types/telegram";
import type { ColorScheme, ThemeParams } from "../schemas/theme";
import type { SafeAreaInset, ContentSafeAreaInset } from "../schemas/safe-area";

export interface WebAppState {
  colorScheme: ColorScheme;
  themeParams: ThemeParams;
  isActive: boolean;
  isExpanded: boolean;
  isFullscreen: boolean;
  isOrientationLocked: boolean;
  isClosingConfirmationEnabled: boolean;
  isVerticalSwipesEnabled: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  bottomBarColor: string;
  safeAreaInset: SafeAreaInset;
  contentSafeAreaInset: ContentSafeAreaInset;
}

type StateKey = keyof WebAppState;

export interface AppState {
  getSnapshot(): Readonly<WebAppState>;
  getValue<K extends StateKey>(key: K): WebAppState[K];
  subscribe<K extends StateKey>(key: K, listener: (value: WebAppState[K]) => void): () => void;
  destroy(): void;
}

// ─── CSS Variable Injection ───────────────────────────────────────────────────

const THEME_VAR_MAP: ReadonlyArray<[keyof ThemeParams, string]> = [
  ["bg_color", "--tg-theme-bg-color"],
  ["text_color", "--tg-theme-text-color"],
  ["hint_color", "--tg-theme-hint-color"],
  ["link_color", "--tg-theme-link-color"],
  ["button_color", "--tg-theme-button-color"],
  ["button_text_color", "--tg-theme-button-text-color"],
  ["secondary_bg_color", "--tg-theme-secondary-bg-color"],
  ["header_bg_color", "--tg-theme-header-bg-color"],
  ["bottom_bar_bg_color", "--tg-theme-bottom-bar-bg-color"],
  ["accent_text_color", "--tg-theme-accent-text-color"],
  ["section_bg_color", "--tg-theme-section-bg-color"],
  ["section_header_text_color", "--tg-theme-section-header-text-color"],
  ["section_separator_color", "--tg-theme-section-separator-color"],
  ["subtitle_text_color", "--tg-theme-subtitle-text-color"],
  ["destructive_text_color", "--tg-theme-destructive-text-color"],
];

function injectCssVars(
  themeParams: ThemeParams,
  safeArea: SafeAreaInset,
  contentSafeArea: ContentSafeAreaInset,
): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  for (const [field, varName] of THEME_VAR_MAP) {
    const value = themeParams[field];
    if (value !== undefined) {
      root.style.setProperty(varName, value);
    }
  }

  root.style.setProperty("--tg-safe-area-inset-top", `${safeArea.top}px`);
  root.style.setProperty("--tg-safe-area-inset-bottom", `${safeArea.bottom}px`);
  root.style.setProperty("--tg-safe-area-inset-left", `${safeArea.left}px`);
  root.style.setProperty("--tg-safe-area-inset-right", `${safeArea.right}px`);

  root.style.setProperty("--tg-content-safe-area-inset-top", `${contentSafeArea.top}px`);
  root.style.setProperty("--tg-content-safe-area-inset-bottom", `${contentSafeArea.bottom}px`);
  root.style.setProperty("--tg-content-safe-area-inset-left", `${contentSafeArea.left}px`);
  root.style.setProperty("--tg-content-safe-area-inset-right", `${contentSafeArea.right}px`);
}

// ─── Factory ──────────────────────────────────────────────────────────────────

function snapshotFromWebApp(wa: TelegramWebApp): WebAppState {
  return {
    colorScheme: wa.colorScheme,
    themeParams: wa.themeParams,
    isActive: wa.isActive,
    isExpanded: wa.isExpanded,
    isFullscreen: wa.isFullscreen,
    isOrientationLocked: wa.isOrientationLocked,
    isClosingConfirmationEnabled: wa.isClosingConfirmationEnabled,
    isVerticalSwipesEnabled: wa.isVerticalSwipesEnabled,
    viewportHeight: wa.viewportHeight,
    viewportStableHeight: wa.viewportStableHeight,
    headerColor: wa.headerColor,
    backgroundColor: wa.backgroundColor,
    bottomBarColor: wa.bottomBarColor,
    safeAreaInset: wa.safeAreaInset,
    contentSafeAreaInset: wa.contentSafeAreaInset,
  };
}

export function createAppState(bridge: TmaBridge): AppState {
  let state = snapshotFromWebApp(bridge.webApp);

  // Listeners stored as unknown callbacks — cast is safe because notify() always
  // passes the correctly-typed value for the corresponding key.
  const listeners = new Map<StateKey, Set<(value: unknown) => void>>();

  function notify<K extends StateKey>(key: K, value: WebAppState[K]): void {
    for (const listener of listeners.get(key) ?? []) {
      listener(value);
    }
  }

  function update<K extends StateKey>(key: K, value: WebAppState[K]): void {
    state = { ...state, [key]: value };
    notify(key, value);
  }

  // ── Event Handlers ──────────────────────────────────────────────────────────

  function onThemeChanged(this: TelegramWebApp): void {
    const wa = bridge.webApp;
    update("colorScheme", wa.colorScheme);
    update("themeParams", wa.themeParams);
    update("headerColor", wa.headerColor);
    update("backgroundColor", wa.backgroundColor);
    update("bottomBarColor", wa.bottomBarColor);
    injectCssVars(wa.themeParams, state.safeAreaInset, state.contentSafeAreaInset);
  }

  function onViewportChanged(this: TelegramWebApp, payload: { isStateStable: boolean }): void {
    const wa = bridge.webApp;
    update("viewportHeight", wa.viewportHeight);
    update("isExpanded", wa.isExpanded);
    if (payload.isStateStable) {
      update("viewportStableHeight", wa.viewportStableHeight);
    }
  }

  function onSafeAreaChanged(this: TelegramWebApp): void {
    const wa = bridge.webApp;
    update("safeAreaInset", wa.safeAreaInset);
    injectCssVars(state.themeParams, wa.safeAreaInset, state.contentSafeAreaInset);
  }

  function onContentSafeAreaChanged(this: TelegramWebApp): void {
    const wa = bridge.webApp;
    update("contentSafeAreaInset", wa.contentSafeAreaInset);
    injectCssVars(state.themeParams, state.safeAreaInset, wa.contentSafeAreaInset);
  }

  function onActivated(this: TelegramWebApp): void {
    update("isActive", true);
  }

  function onDeactivated(this: TelegramWebApp): void {
    update("isActive", false);
  }

  function onFullscreenChanged(this: TelegramWebApp): void {
    update("isFullscreen", bridge.webApp.isFullscreen);
    update("isOrientationLocked", bridge.webApp.isOrientationLocked);
  }

  bridge.on("themeChanged", onThemeChanged);
  bridge.on("viewportChanged", onViewportChanged);
  bridge.on("safeAreaChanged", onSafeAreaChanged);
  bridge.on("contentSafeAreaChanged", onContentSafeAreaChanged);
  bridge.on("activated", onActivated);
  bridge.on("deactivated", onDeactivated);
  bridge.on("fullscreenChanged", onFullscreenChanged);

  // Inject CSS vars from the initial state immediately.
  injectCssVars(state.themeParams, state.safeAreaInset, state.contentSafeAreaInset);

  return {
    getSnapshot(): Readonly<WebAppState> {
      return state;
    },

    getValue<K extends StateKey>(key: K): WebAppState[K] {
      return state[key];
    },

    subscribe<K extends StateKey>(
      key: K,
      listener: (value: WebAppState[K]) => void,
    ): () => void {
      if (!listeners.has(key)) {
        listeners.set(key, new Set());
      }
      listeners.get(key)!.add(listener as (value: unknown) => void);

      return () => {
        listeners.get(key)?.delete(listener as (value: unknown) => void);
      };
    },

    destroy(): void {
      bridge.off("themeChanged", onThemeChanged);
      bridge.off("viewportChanged", onViewportChanged);
      bridge.off("safeAreaChanged", onSafeAreaChanged);
      bridge.off("contentSafeAreaChanged", onContentSafeAreaChanged);
      bridge.off("activated", onActivated);
      bridge.off("deactivated", onDeactivated);
      bridge.off("fullscreenChanged", onFullscreenChanged);
      listeners.clear();
    },
  };
}
