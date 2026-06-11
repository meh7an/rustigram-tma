import { createEffect, onCleanup, onMount, type Component } from "solid-js";
import { useTma } from "../provider/use-tma";

export interface BackButtonProps {
  onBack: () => void;
}

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
