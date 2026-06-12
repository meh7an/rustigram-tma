import { onCleanup, type JSX } from "solid-js";
import { initBridge, createAppState } from "@rustigram/tma-core";
import type { BridgeOptions } from "@rustigram/tma-core";
import { TmaContext, type TmaContextValue } from "./use-tma";

export interface TmaProviderProps {
  options?: BridgeOptions;
  /**
   * Rendered when Telegram WebApp is not available — e.g. opening the page
   * in a regular browser without the CDN script loaded.
   */
  fallback?: JSX.Element;
  children: JSX.Element;
}

export function TmaProvider(props: TmaProviderProps): JSX.Element {
  // Component functions in Solid run exactly once — safe to initialise here.
  let ctx: TmaContextValue | null = null;

  try {
    console.log("[TmaProvider] window.Telegram:", window.Telegram);
    const bridge = initBridge(props.options);
    const appState = createAppState(bridge);
    ctx = { bridge, appState };
    onCleanup(() => appState.destroy());
  } catch {
    // Not in a Telegram environment — fall through to fallback.
  }

  if (!ctx) {
    return (props.fallback ?? null) as JSX.Element;
  }

  const value = ctx;
  return <TmaContext.Provider value={value}>{props.children}</TmaContext.Provider>;
}
