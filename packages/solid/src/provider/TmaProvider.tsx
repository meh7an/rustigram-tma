import { onCleanup, type JSX } from "solid-js";
import { initBridge, createAppState } from "@rustigram/tma-core";
import type { BridgeOptions } from "@rustigram/tma-core";
import { TmaContext, type TmaContextValue } from "./use-tma";

/** Props for the `<TmaProvider>` component. */
export interface TmaProviderProps {
  /**
   * Options forwarded to `initBridge()`. Pass `{ mockWebApp }` in tests to
   * inject a mock `TelegramWebApp` instance.
   */
  options?: BridgeOptions;
  /**
   * Rendered when `window.Telegram.WebApp` is not available — e.g. when the
   * page is opened in a regular browser without the Telegram CDN script
   * loaded. If omitted, nothing is rendered in that case.
   */
  fallback?: JSX.Element;
  /** The component tree that requires TMA context. */
  children: JSX.Element;
}

/**
 * Root context provider for `@rustigram/tma-solid`.
 *
 * Calls `initBridge()` and `createAppState()` once on mount, injects the
 * resulting `TmaContextValue` into the Solid context tree, and destroys
 * the `AppState` on cleanup.
 *
 * If `window.Telegram.WebApp` is not available (e.g. regular browser),
 * `initBridge()` will throw and the component renders `props.fallback`
 * instead of `props.children`.
 *
 * All `@rustigram/tma-solid` hooks and components must be rendered inside
 * a `<TmaProvider>`.
 *
 * @example
 * // app.tsx
 * export default function App() {
 *   return (
 *     <TmaProvider fallback={<p>Open in Telegram</p>}>
 *       <Router>
 *         <FileRoutes />
 *       </Router>
 *     </TmaProvider>
 *   );
 * }
 *
 * @example
 * // Testing
 * import { createTmaMock } from "@rustigram/tma-core/mock";
 * const mock = createTmaMock();
 * render(() => (
 *   <TmaProvider options={{ mockWebApp: mock.webApp }}>
 *     <MyComponent />
 *   </TmaProvider>
 * ), container);
 */
export function TmaProvider(props: TmaProviderProps): JSX.Element {
  // Component functions in Solid run exactly once — safe to initialise here.
  let ctx: TmaContextValue | null = null;

  try {
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
