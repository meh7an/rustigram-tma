import { createContext, useContext } from "solid-js";
import type { TmaBridge, AppState } from "@rustigram/tma-core";

/**
 * The value provided by `<TmaProvider>` and consumed by `useTma()`.
 */
export interface TmaContextValue {
  /** The initialised `TmaBridge` instance. Use for direct WebApp API calls. */
  bridge: TmaBridge;
  /** The reactive `AppState` instance bound to the bridge. */
  appState: AppState;
}

/** @internal */
export const TmaContext = createContext<TmaContextValue | undefined>(undefined);

/**
 * Access the `TmaContextValue` provided by the nearest `<TmaProvider>`.
 *
 * Throws if called outside of a `<TmaProvider>` tree — this is always a
 * programming error and should surface immediately in development.
 *
 * @example
 * function MyComponent() {
 *   const { bridge, appState } = useTma();
 *   const scheme = appState.getValue("colorScheme");
 *   return <div>{scheme}</div>;
 * }
 */
export function useTma(): TmaContextValue {
  const ctx = useContext(TmaContext);
  if (!ctx) {
    throw new Error(
      "useTma() must be called inside a <TmaProvider>. " +
      "Wrap your app root with <TmaProvider> before using any rustigram-tma hooks.",
    );
  }
  return ctx;
}