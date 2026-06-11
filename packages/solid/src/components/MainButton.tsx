import { createEffect, onCleanup, onMount, type Component } from "solid-js";
import type { BottomButtonParams } from "@rustigram/tma-core";
import { useTma } from "../provider/use-tma";

export interface MainButtonProps {
  text?: string;
  color?: string;
  textColor?: string;
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
}

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
