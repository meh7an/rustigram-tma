import { createContext, useContext } from "solid-js";
import type { TmaBridge, AppState } from "@rustigram/tma-core";

export interface TmaContextValue {
  bridge: TmaBridge;
  appState: AppState;
}

export const TmaContext = createContext<TmaContextValue | undefined>(undefined);

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
