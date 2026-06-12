import { createEffect, onCleanup, onMount, type Component } from "solid-js";
import type { BottomButtonParams } from "@rustigram/tma-core";
import { useTma } from "../provider/use-tma";

/** Props for the `MainButton` component. */
export interface MainButtonProps {
  /** Button label text. */
  text?: string;
  /** Button background color in `#RRGGBB` format. */
  color?: string;
  /** Button text color in `#RRGGBB` format. */
  textColor?: string;
  /** When `true`, the button is shown but does not accept clicks. */
  disabled?: boolean;
  /** When `true`, shows a loading spinner on the button. */
  loading?: boolean;
  /** Called when the user taps the main button. */
  onClick: () => void;
}

/**
 * Renders nothing but shows the Telegram main bottom button while mounted
 * and hides it on unmount. All props are reactive — changing them updates
 * the button without remounting.
 *
 * Must be rendered inside a `<TmaProvider>`.
 *
 * @example
 * <MainButton
 *   text="Continue"
 *   disabled={!isFormValid()}
 *   loading={isSubmitting()}
 *   onClick={handleSubmit}
 * />
 */
export const MainButton: Component<MainButtonProps> = (props) => {
  const { bridge } = useTma();
  const btn = bridge.webApp.MainButton;

  onMount(() => {
    btn.show();
    onCleanup(() => btn.hide());
  });

  createEffect(() => {
    const params: BottomButtonParams = { is_visible: true };
    if (props.text !== undefined) params.text = props.text;
    if (props.color !== undefined) params.color = props.color;
    if (props.textColor !== undefined) params.text_color = props.textColor;
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
