import { ErrorBoundary, type JSX, type Component } from "solid-js";

/** Props for the `<TmaErrorBoundary>` component. */
export interface TmaErrorBoundaryProps {
  /**
   * Rendered when an uncaught error is thrown anywhere in the child tree.
   *
   * Receives the thrown `Error` instance so you can display a contextual
   * message or report it to an error tracking service.
   *
   * @example
   * fallback={(err) => <p>Something went wrong: {err.message}</p>}
   */
  fallback: (error: Error) => JSX.Element;
  /** The component tree to protect. */
  children: JSX.Element;
}

/**
 * A typed error boundary for `@rustigram/tma-solid` component trees.
 *
 * Wraps Solid's built-in `ErrorBoundary` with a strongly-typed `fallback`
 * prop that receives the thrown `Error`, and resets automatically when the
 * child tree is re-mounted.
 *
 * Use this to catch errors thrown by TMA hooks (e.g. `TmaSensorError`,
 * `TmaBridgeError`) that escape component-level handling, preventing them
 * from propagating up and crashing the entire app.
 *
 * Must be rendered inside a `<TmaProvider>` when wrapping components that
 * consume TMA context.
 *
 * @example
 * // Protect a single feature section
 * <TmaErrorBoundary fallback={(err) => <p>Sensor unavailable: {err.message}</p>}>
 *   <AccelerometerDisplay />
 * </TmaErrorBoundary>
 *
 * @example
 * // Report to an error tracking service
 * <TmaErrorBoundary
 *   fallback={(err) => {
 *     reportError(err);
 *     return <FallbackUI />;
 *   }}
 * >
 *   <FeatureRoute />
 * </TmaErrorBoundary>
 */
export const TmaErrorBoundary: Component<TmaErrorBoundaryProps> = (props) => {
  return (
    <ErrorBoundary
      fallback={(err: unknown) => {
        // Normalise non-Error throws (e.g. thrown strings or objects) so the
        // consumer always receives a proper Error instance.
        const error = err instanceof Error ? err : new Error(String(err));
        return props.fallback(error);
      }}
    >
      {props.children}
    </ErrorBoundary>
  );
};
