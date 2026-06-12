import { createEffect, onCleanup, onMount, type Component } from "solid-js";
import { useTma } from "../provider/use-tma";

/** Props for the `SettingsButton` component. */
export interface SettingsButtonProps {
  /** Called when the user taps the settings item in the Mini App context menu. */
  onSettings: () => void;
}

/**
 * Renders nothing but shows the settings item in the Telegram Mini App
 * context menu while mounted and hides it on unmount. Reactively
 * re-registers the `onSettings` handler whenever the prop changes.
 *
 * Must be rendered inside a `<TmaProvider>`.
 *
 * @since Bot API 7.0
 *
 * @example
 * <SettingsButton onSettings={() => navigate("/settings")} />
 */
export const SettingsButton: Component<SettingsButtonProps> = (props) => {
  const { bridge } = useTma();
  const btn = bridge.webApp.SettingsButton;

  onMount(() => {
    btn.show();
    onCleanup(() => btn.hide());
  });

  createEffect(() => {
    const handler = props.onSettings;
    btn.onClick(handler);
    onCleanup(() => btn.offClick(handler));
  });

  return null;
};
