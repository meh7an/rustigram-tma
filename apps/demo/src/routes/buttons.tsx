import { createSignal, For } from "solid-js";
import { useNavigate } from "@solidjs/router";
import {
  BackButton, MainButton, SettingsButton, useIsVersionAtLeast, useTma,
} from "@rustigram/tma-solid";
import { Section, Row, Badge, toast } from "../components/index";

const IMPACT_STYLES = ["light", "medium", "heavy", "rigid", "soft"] as const;
const NOTIF_TYPES   = ["success", "warning", "error"] as const;

export default function ButtonsPage() {
  const navigate = useNavigate();
  const { bridge } = useTma();
  const haptic = bridge.webApp.HapticFeedback;

  const [mainText, setMainText] = createSignal("Tap me");
  const [lastClick, setLastClick] = createSignal<string | null>(null);
  const [loading, setLoading] = createSignal(false);
  const [showSettings, setShowSettings] = createSignal(false);
  const [settingsLog, setSettingsLog] = createSignal<string[]>([]);
  const [activeImpact, setActiveImpact] = createSignal<string | null>(null);
  const [activeNotif, setActiveNotif] = createSignal<string | null>(null);
  const isV710 = useIsVersionAtLeast("7.10");

  function fireImpact(style: typeof IMPACT_STYLES[number]) {
    haptic.impactOccurred(style);
    setActiveImpact(style);
    setTimeout(() => setActiveImpact(null), 300);
  }

  function fireNotif(type: typeof NOTIF_TYPES[number]) {
    haptic.notificationOccurred(type);
    setActiveNotif(type);
    setTimeout(() => setActiveNotif(null), 300);
  }

  function handleMainClick() {
    if (loading()) return;
    setLoading(true);
    const ts = new Date().toLocaleTimeString();
    setTimeout(() => { setLoading(false); setLastClick(ts); toast("Main button tapped"); }, 1200);
  }

  return (
    <div class="page">
      <BackButton onBack={() => navigate(-1)} />
      <MainButton
        text={loading() ? "Loading…" : mainText()}
        loading={loading()}
        onClick={handleMainClick}
      />
      {showSettings() && (
        <SettingsButton
          onSettings={() => {
            const ts = new Date().toLocaleTimeString();
            setSettingsLog((l) => [`⚙ ${ts}`, ...l.slice(0, 4)]);
            toast("Settings tapped");
          }}
        />
      )}

      <Section title="Main Button">
        <div class="field-row">
          <span class="row-label" style={{ "font-size": "13px", "flex-shrink": "0" }}>Label</span>
          <input
            class="input"
            value={mainText()}
            onInput={(e) => setMainText(e.currentTarget.value)}
            placeholder="Button text"
          />
        </div>
        <Row label="Last click" value={lastClick() ?? "—"} />
        <Row label="Loading demo" value={<span style={{ "font-size": "13px", color: "var(--tg-theme-hint-color)" }}>tap the button above</span>} />
      </Section>

      <Section title="Settings Button">
        <div class="row" style={{ cursor: "pointer" }} onClick={() => setShowSettings((v) => !v)}>
          <span class="row-label">Show settings button</span>
          <Badge label={showSettings() ? "ON" : "OFF"} active={showSettings()} />
        </div>
        {settingsLog().length > 0 && (
          <For each={settingsLog()}>
            {(entry) => (
              <div class="row" style={{ "font-family": "'SF Mono','Fira Code',monospace", "font-size": "12px", color: "var(--tg-theme-hint-color)" }}>
                {entry}
              </div>
            )}
          </For>
        )}
      </Section>

      <Section title="Haptic — Impact">
        <div class="chips">
          <For each={IMPACT_STYLES}>
            {(s) => (
              <button class={`chip${activeImpact() === s ? " active" : ""}`} onClick={() => fireImpact(s)}>
                {s}
              </button>
            )}
          </For>
        </div>
      </Section>

      <Section title="Haptic — Notification">
        <div class="chips">
          <For each={NOTIF_TYPES}>
            {(t) => (
              <button class={`chip${activeNotif() === t ? " active" : ""}`} onClick={() => fireNotif(t)}>
                {t}
              </button>
            )}
          </For>
        </div>
        <div class="chips">
          <button class="chip" onClick={() => { haptic.selectionChanged(); toast("selection changed"); }}>
            selectionChanged
          </button>
        </div>
      </Section>

      {isV710() && (
        <Section title="Secondary Button">
          <Row label="Status" value={<Badge label="Available" variant="on" />} />
          <Row label="Note" value={<span style={{ "font-size": "13px", color: "var(--tg-theme-hint-color)" }}>see /fullscreen for demo</span>} />
        </Section>
      )}
    </div>
  );
}
