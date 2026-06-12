import { createEffect, onCleanup, onMount, type Component } from "solid-js";
import type { BottomButtonParams } from "@rustigram/tma-core";
import { useTma } from "../provider/use-tma";

/** Props for the `SecondaryButton` component. */
export interface SecondaryButtonProps {
  /** Button label text. */
  text?: string;
  /** Button background color in `#RRGGBB` format. */
  color?: string;
  /** Button text color in `#RRGGBB` format. */
  textColor?: string;
  /**
   * Position of the secondary button relative to the main button.
   * @since Bot API 7.10
   */
  position?: "left" | "right" | "top" | "bottom";
  /** When `true`, the button is shown but does not accept clicks. */
  disabled?: boolean;
  /** When `true`, shows a loading spinner on the button. */
  loading?: boolean;
  /** Called when the user taps the secondary button. */
  onClick: () => void;
}

/**
 * Renders nothing but shows the Telegram secondary bottom button while
 * mounted and hides it on unmount. All props are reactive — changing them
 * updates the button without remounting.
 *
 * Logs a warning and renders nothing if the current Bot API version is
 * below 7.10.
 *
 * Must be rendered inside a `<TmaProvider>`.
 *
 * @since Bot API 7.10
 *
 * @example
 * <SecondaryButton
 *   text="Cancel"
 *   position="left"
 *   onClick={handleCancel}
 * />
 */
export const SecondaryButton: Component<SecondaryButtonProps> = (props) => {
  const { bridge } = useTma();

  if (!bridge.isVersionAtLeast("7.10")) {
    console.warn(
      `[rustigram-tma] SecondaryButton requires Bot API 7.10+. ` +
        `Current version: ${bridge.launchContext.version}`,
    );
    return null;
  }

  const btn = bridge.webApp.SecondaryButton;

  onMount(() => {
    btn.show();
    onCleanup(() => btn.hide());
  });

  createEffect(() => {
    const params: BottomButtonParams = { is_visible: true };
    if (props.text !== undefined) params.text = props.text;
    if (props.color !== undefined) params.color = props.color;
    if (props.textColor !== undefined) params.text_color = props.textColor;
    if (props.position !== undefined) params.position = props.position;
    if (props.disabled !== undefined) params.is_active = !props.disabled;
    btn.setParams(params);
  });

  createEffect(() => {
    if (props.loading) btn.showProgress(true);
    else btn.hideProgress();
  });

  createEffect(() => {
    const handler = props.onClick;
    btn.onClick(handler);
    onCleanup(() => btn.offClick(handler));
  });

  return null;
};
