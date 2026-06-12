import { createEffect, onCleanup, onMount, type Component } from "solid-js";
import { useTma } from "../provider/use-tma";

/** Props for the `BackButton` component. */
export interface BackButtonProps {
  /** Called when the user taps the Telegram header back button. */
  onBack: () => void;
}

/**
 * Renders nothing but shows the Telegram header back button while mounted
 * and hides it on unmount. Reactively re-registers the `onBack` handler
 * whenever the prop changes.
 *
 * Must be rendered inside a `<TmaProvider>`.
 *
 * @since Bot API 6.1
 *
 * @example
 * <BackButton onBack={() => navigate(-1)} />
 */
export const BackButton: Component<BackButtonProps> = (props) => {
  const { bridge } = useTma();
  const btn = bridge.webApp.BackButton;

  onMount(() => {
    btn.show();
    onCleanup(() => btn.hide());
  });

  createEffect(() => {
    const handler = props.onBack;
    btn.onClick(handler);
    onCleanup(() => btn.offClick(handler));
  });

  return null;
};
