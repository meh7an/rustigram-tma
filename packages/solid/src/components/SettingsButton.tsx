import { createEffect, onCleanup, onMount, type Component } from "solid-js";
import { useTma } from "../provider/use-tma";

export interface SettingsButtonProps {
  onSettings: () => void;
}

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
