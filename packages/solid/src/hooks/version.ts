import type { Accessor } from "solid-js";
import { useTma } from "../provider/use-tma";

/**
 * Return value of `useVersionGate()`.
 */
export interface VersionGateHook {
    /**
     * Reactive signal that is `true` when the current Telegram client's Bot API
     * version is at or above the requested `version`.
     *
     * The value is stable for the lifetime of the component — Bot API version
     * does not change at runtime — so the accessor will never re-fire after the
     * initial read. It is exposed as an `Accessor` for consistency with the rest
     * of the hook API and to allow future reactivity without a breaking change.
     */
    supported: Accessor<boolean>;
}

/**
 * Solid hook that checks whether the current Telegram client supports a
 * minimum Bot API version.
 *
 * Use this to conditionally render features that require a specific Bot API
 * version, keeping older clients from hitting unsupported APIs.
 *
 * Must be called inside a component tree wrapped by `<TmaProvider>`.
 *
 * @param version - The minimum Bot API version string to check against,
 *   e.g. `"8.0"` or `"9.0"`.
 *
 * @example
 * // Conditionally render a feature requiring Bot API 9.0
 * const { supported } = useVersionGate("9.0");
 *
 * return (
 *   <Show when={supported()} fallback={<p>Update Telegram to use this feature.</p>}>
 *     <DeviceStorageFeature />
 *   </Show>
 * );
 *
 * @example
 * // Guard an entire route
 * const { supported } = useVersionGate("8.0");
 * if (!supported()) return <Navigate href="/" />;
 */
export function useVersionGate(version: string): VersionGateHook {
    const { bridge } = useTma();
    // Captured once — Bot API version is immutable for the lifetime of the app.
    const isSupported = bridge.isVersionAtLeast(version);

    return {
        // Wrapped in a plain function to satisfy the Accessor<boolean> contract
        // without creating a reactive signal, since the value never changes.
        supported: () => isSupported,
    };
}